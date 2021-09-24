from cryptography.fernet import Fernet;
import datetime;

def readFileContents():
    with open("storage.csv", "r") as file:
        contents = file.read();
        return contents;

def writeToFile(contentToAdd):
    with open("storage.csv", "a") as file:
        file.write(contentToAdd + "\n");
        print("Content added to File");

def getKey():
    with open("key.txt", "rb") as file:
        return file.read();

def encryptFile(key):
    f = Fernet(key);
    with open("storage.csv", "rb") as file:
        contents = file.read()
    encContents = f.encrypt(contents);
    with open("storage.csv", "wb") as f:
        f.write(encContents);
"""
def preFileDec(key):
    f = Fernet(key);
    with open("storage.csv", "rb") as file:
        contents = file.read();
    decContents = f.decrypt(contents);
    #with open("storage.csv", "wb") as fle:
        #fle.write(decContents);
    return decContents;
"""
def decFileReturner(key):
    f = Fernet(key);
    with open("storage.csv", "rb") as file:
        contents = file.read();
    decContents = f.decrypt(contents);
    with open("storage.csv", "wb") as fle:
        fle.write(decContents);
    return decContents;

def CntHandlerRead():
    with open("cnt.txt", "r") as cntFile:
        curCount = cntFile.read();
        return int(curCount);
def CntHandlerAdd(newCnt):
    with open("cnt.txt", "w") as cntFile:
        cntFile.write(str(newCnt));

def main(incData):
    curCnt = CntHandlerRead();
    print("Current Count: " + str(curCnt));
    print("adding contents to file");
    time = datetime.datetime.now();
    writeToFile(str(curCnt) + " " + incData + " " + str(time));
    curCnt = curCnt + 1;
    CntHandlerAdd(curCnt);
    print("-------Encrpyting File-----------");
    print("Fetching key");
    print("Pre Decrpyting");
    key = getKey();
    #preFileDec(key);
    print("Encrypt File")
    encryptFile(key);
    print("-------------Reading file-----------")
    contents = readFileContents();
    print(contents);
    print("-------------decrpyting file----------");
    decCont = decFileReturner(key);
    c = readFileContents();
    print(readFileContents());

if __name__=="__main__":
    main();
    
