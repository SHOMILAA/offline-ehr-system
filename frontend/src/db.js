import initSqlJs from 'sql.js';

let db = null;
let sqlPromise = null;

export const initDB = async () => {
    if (db) return db;
    if (sqlPromise) return sqlPromise;

    sqlPromise = (async () => {
        try {
            // Load sql.js
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });
            
            // Try to load from localStorage first
            const savedDb = localStorage.getItem('ehr_sqlite_db');
            if (savedDb) {
                const uInt8Array = new Uint8Array(savedDb.split(',').map(Number));
                db = new SQL.Database(uInt8Array);
                console.log("Loaded existing SQLite DB from LocalStorage");
            } else {
                db = new SQL.Database();
                console.log("Created new SQLite DB");
                
                // Initialize schema
                db.run(`
                    CREATE TABLE patients (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        mongoId TEXT,
                        patientName TEXT NOT NULL,
                        phoneNumber TEXT NOT NULL,
                        age INTEGER,
                        gender TEXT,
                        village TEXT,
                        bloodGroup TEXT,
                        assignedDoctor TEXT,
                        hospitalName TEXT,
                        symptoms TEXT,
                        diagnosis TEXT,
                        medicines TEXT,
                        doctorNotes TEXT,
                        visitDate TEXT,
                        nextVisit TEXT,
                        allergies TEXT,
                        bloodPressure TEXT,
                        temperature TEXT,
                        heartRate TEXT,
                        isNewRecord BOOLEAN DEFAULT 1,
                        isEdited BOOLEAN DEFAULT 0
                    );
                `);
                
                db.run(`
                    CREATE TABLE medicalHistory (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        mongoId TEXT,
                        patientId TEXT NOT NULL,
                        doctorId TEXT NOT NULL,
                        symptoms TEXT,
                        diagnosis TEXT,
                        medicines TEXT,
                        doctorNotes TEXT,
                        visitDate TEXT,
                        nextVisit TEXT,
                        allergies TEXT,
                        bloodPressure TEXT,
                        temperature TEXT,
                        heartRate TEXT,
                        hospitalName TEXT,
                        isNewRecord BOOLEAN DEFAULT 1
                    );
                `);
                
                saveDB();
            }
            return db;
        } catch (error) {
            console.error("Error initializing SQLite WASM:", error);
            throw error;
        }
    })();

    return sqlPromise;
};

// Quick persistence for SQLite in browser
export const saveDB = () => {
    if (!db) return;
    const data = db.export(); // Uint8Array
    localStorage.setItem('ehr_sqlite_db', data.join(','));
};

export const getDB = () => db;

// Helper to get all patients
export const getOfflinePatients = () => {
    if (!db) return [];
    try {
        const stmt = db.prepare("SELECT * FROM patients");
        const rows = [];
        while(stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    } catch(err) {
        console.error(err);
        return [];
    }
};

// Helper to save patient
export const addOfflinePatient = (patientObj) => {
    if (!db) return;
    const { patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate } = patientObj;
    
    // We generate a temporary UUID to link them in SQLite so sync logic can resolve them correctly.
    const tempMongoId = 'temp_' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    db.run(
        `INSERT INTO patients (mongoId, patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, isNewRecord, isEdited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
        [tempMongoId, patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate]
    );

    // Also inject the initial medical history record using the tempMongoId
    db.run(
        `INSERT INTO medicalHistory (patientId, doctorId, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, hospitalName, isNewRecord) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [tempMongoId, assignedDoctor, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, hospitalName]
    );
    
    saveDB();
};

export const updateOfflinePatient = (patientObj) => {
    if (!db) return;
    const { _id, id, patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate } = patientObj;
    const searchId = _id || id;
    
    // Upsert into local db marking it edited, so sync knows.
    db.run(
        `INSERT OR REPLACE INTO patients (mongoId, patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, isNewRecord, isEdited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)`,
        [searchId, patientName, phoneNumber, age, gender, village, bloodGroup, assignedDoctor, hospitalName, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate]
    );
    saveDB();
};

export const addOfflineHistory = (historyObj) => {
    if (!db) return;
    const { patientId, doctorId, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, hospitalName } = historyObj;
    db.run(
        `INSERT INTO medicalHistory (patientId, doctorId, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, hospitalName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [patientId, doctorId, symptoms, diagnosis, medicines, doctorNotes, visitDate, nextVisit, allergies, bloodPressure, temperature, heartRate, hospitalName]
    );
    saveDB();
};

export const getOfflineHistories = () => {
    if (!db) return [];
    try {
        const stmt = db.prepare("SELECT * FROM medicalHistory WHERE isNewRecord = 1");
        const rows = [];
        while(stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    } catch(err) {
        return [];
    }
}

export const deleteOfflinePatient = (mongoId) => {
    if (!db) return;
    try {
        db.run(`DELETE FROM patients WHERE mongoId = ?`, [mongoId]);
        saveDB();
        
        // Add to offline deletes queue
        let deletes = [];
        const raw = localStorage.getItem('ehr_offline_deletes');
        if (raw) deletes = JSON.parse(raw);
        if (!deletes.includes(mongoId)) deletes.push(mongoId);
        localStorage.setItem('ehr_offline_deletes', JSON.stringify(deletes));
    } catch(err) {
        console.error("Error deleting offline", err);
    }
};

export const getOfflineDeletes = () => {
    const raw = localStorage.getItem('ehr_offline_deletes');
    return raw ? JSON.parse(raw) : [];
};

export const clearOfflineDeletes = () => {
    localStorage.removeItem('ehr_offline_deletes');
};

export const clearDB = () => {
    localStorage.removeItem('ehr_sqlite_db');
    localStorage.removeItem('ehr_offline_deletes');
    db = null;
    sqlPromise = null;
};

export const markSynced = () => {
    if (!db) return;
    try {
        db.run("UPDATE patients SET isNewRecord = 0, isEdited = 0");
        db.run("UPDATE medicalHistory SET isNewRecord = 0");
        clearOfflineDeletes();
        saveDB();
    } catch (err) {
        console.error("Error marking synced in SQLite:", err);
    }
};
