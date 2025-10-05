'use server';

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '../firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../firebase/errors';


interface HistoryData {
  type: 'conduccion' | 'pausa';
  duration: number;
  distance?: number;
  status: 'completado' | 'interrumpido';
}

export async function addHistoryItem(db: Firestore, userId: string, data: HistoryData) {
  const historyCollectionRef = collection(db, 'users', userId, 'history');
  
  addDoc(historyCollectionRef, {
    ...data,
    timestamp: serverTimestamp(),
  }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: historyCollectionRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
  });

  // Update aggregated stats in a transaction
  await updateStats(db, userId, data);
}

async function updateStats(db: Firestore, userId: string, data: HistoryData) {
    const statsRef = doc(db, 'users', userId, 'stats', 'summary');

    try {
        await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsRef);
            
            if (!statsDoc.exists()) {
                const newStats = {
                    totalDistance: data.type === 'conduccion' ? (data.distance || 0) : 0,
                    totalDrivingTime: data.type === 'conduccion' ? data.duration : 0,
                    totalPauseTime: data.type === 'pausa' ? data.duration : 0,
                    avgSpeed: 0,
                    lastUpdated: serverTimestamp()
                };
                transaction.set(statsRef, newStats);
            } else {
                const oldStats = statsDoc.data();
                const newTotalDrivingTime = oldStats.totalDrivingTime + (data.type === 'conduccion' ? data.duration : 0);
                const newTotalDistance = oldStats.totalDistance + (data.type === 'conduccion' ? (data.distance || 0) : 0);
                
                const newAvgSpeed = newTotalDrivingTime > 0 
                    ? (newTotalDistance / (newTotalDrivingTime / 3600)) // km / h
                    : 0;

                transaction.update(statsRef, {
                    totalDistance: newTotalDistance,
                    totalDrivingTime: newTotalDrivingTime,
                    totalPauseTime: oldStats.totalPauseTime + (data.type === 'pausa' ? data.duration : 0),
                    avgSpeed: newAvgSpeed,
                    lastUpdated: serverTimestamp()
                });
            }
        });
    } catch (error: any) {
        // This could also be a permission error, especially on the 'get' or 'update'
        const isPermissionError = error.code === 'permission-denied';
        if (isPermissionError) {
             const permissionError = new FirestorePermissionError({
                path: statsRef.path,
                operation: 'write', // 'get' or 'update' can happen inside a transaction
                requestResourceData: data,
             } satisfies SecurityRuleContext);
             errorEmitter.emit('permission-error', permissionError);
        }
    }
}
