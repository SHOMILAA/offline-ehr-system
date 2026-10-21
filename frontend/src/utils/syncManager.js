import { getOfflinePatients, getOfflineHistories, getOfflineDeletes, markSynced } from '../db'; // and other db helpers

export const syncOfflineData = async () => {
    try {
        const patients = getOfflinePatients();
        const medicalHistories = getOfflineHistories();
        
        const deletedPatients = getOfflineDeletes();

        if (patients.length === 0 && medicalHistories.length === 0 && deletedPatients.length === 0) {
            console.log("No offline data to sync");
            return { success: true, message: "No data to sync" };
        }

        const payload = {
            patients,
            medicalHistories,
            deletedPatients
        };

        const res = await fetch('http://localhost:5000/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log("Sync successful. Clearing offline queue.");
            markSynced();
            return { success: true, message: "Sync successful" };
        } else {
            const err = await res.json();
            throw new Error(err.message || 'Sync failed');
        }
    } catch (err) {
        console.error("Sync error:", err);
        return { success: false, message: err.message };
    }
};
