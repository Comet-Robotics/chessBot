/*
 * Save Manager
 *
 * Manages server side game saves
 * Saves and loads games from separate files on disk
 * Keeps track of clients via cookie ids
 * All methods are static in case the server crashes
 *
 * Created: 9/12/24
 * Modified: 9/20/24
 */

//Save files contain a date in ms and pgn string
export interface iSave {
    date: number;
    pgn: string;
}

export class SaveManager {
    /*
     * saveGame
     *
     * Finds or creates a save file
     * Save name is host id + client id
     * Saves include the game start time and save pgn as json
     *
     * Input: host id, client id, game pgn
     * Output: boolean competed
     */
    public static saveGame(hostId: string, clientID: string, pgn: string) {
        const date = new Date().getTime();
        const saveContents = { date, pgn } as iSave;
        FileManager.writeFile(hostId + "+" + clientID, saveContents);
    }

    /*
     * loadGame
     *
     * Locates and returns save based on id
     *
     * Input: id
     * Output: pgn
     */
    public static loadGame(id: string): string {
        const entryNames = FileManager.getFileNames();
        let entryFound;
        for (const e of entryNames) {
            if (e.includes(id)) {
                entryFound = e;
                break;
            }
        }
        const save = FileManager.loadFile(entryFound);
        if (entryFound && save.pgn) {
            return save.pgn;
        }
        return "";
    }

    /*
     * endGame
     *
     * removes game when finished
     * redundant? maybe
     *
     * Input: host id, client id
     * Output: boolean isSuccessful
     */
    public static endGame(hostId: string, clientId: string) {
        return FileManager.deleteFile(hostId + "+" + clientId);
    }

    /*
     * removeOld
     *
     * Searches through saves, removing ones older than 3 hours
     */

    //Save game and save file are separate for future-proofing in case we change to a database.
    public static removeOld() {
        const date = new Date().getTime();

        const file: string[] = FileManager.getFileNames();
        file.forEach((f) => {
            const save = FileManager.loadFile(f);
            if (save.date > date + 10800000) {
                //3 hours in ms
                FileManager.deleteFile(f);
            }
        });
    }
}

/*
 * File Manager
 *
 * Manages files
 * Can write, load, and delete local files
 *
 */
export class FileManager {
    private static FilePath = "../saves";
    private static fs = require("fs");

    /*
     * writeFile
     *
     * Writes save to file
     * save name as file name
     *
     * Input: save name, save contents
     * Creates: save file with save name
     * Output: boolean isSaved
     */
    public static writeFile(saveName: string, saveContents: iSave) {
        try {
            this.fs.writeFileSync(saveName, saveContents, { flag: "w" });
            return true;
        } catch {
            return false;
        }
    }

    /*
     * loadFile
     *
     * loads save data from file name
     *
     * Input: file name
     * Output: iSave
     */
    public static loadFile(fileName: string): iSave {
        this.fs.readFile(this.FilePath + "/" + fileName, (err, input) => {
            return JSON.parse(input.toString());
        });
        return {} as iSave;
    }

    /*
     * getFileNames
     *
     * returns the names of all stored files
     *
     * Output: Array of file names
     */
    public static getFileNames(): string[] {
        const fileNames: string[] = [];
        this.fs.readdir(this.FilePath, (err, files) => {
            files.array.forEach((file) => {
                fileNames.push(file);
            });
        });
        return fileNames;
    }

    /*
     * deleteFile
     *
     * deletes inputted filename
     *
     * Input: host id, client id
     */
    public static deleteFile(fileName: string) {
        this.fs.unlink(this.FilePath + "/" + fileName, (err) => {
            if (err) {
                console.error(err);
                return false;
            } else {
                return true;
            }
        });
    }
}
