const syncDataArray: any[] = []
const syncFileDataArray: File[] = []
let isSyncing = false
let isFileSyncing = false

async function aspectPush (params: any, arr: any[], dataSyncUpdate: (params: any, arr: any[]) => Promise<any>, ...args: any[]) {
  const res = arr.push(args)
  await dataSyncUpdate(params, arr)
  return res
}

async function aspectShift (params: any, arr: any[], dataSyncUpdate: (params: any, arr: any[]) => Promise<any>) {
  const res = arr.shift()
  await dataSyncUpdate(params, arr)
  return res
}

async function dataSyncUpdate (params: any, arr: any[]) {
  console.log('update data:',params,arr);
  return 'success'
}

export async function syncPush (...args: any[]) {
  const params = {
    id: 'id',
    createdBy: ''
  }
  return aspectPush(params, syncDataArray, dataSyncUpdate, ...args)
}

async function syncShift () {
  const params = {
    id: 'id',
    createdBy: ''
  }
  return aspectShift(params, syncDataArray, dataSyncUpdate)
}

export async function syncData () {
  if (isSyncing) return

  if (syncDataArray.length === 0) return

  isSyncing = true
  try {
    await syncNextData(pushDataToWeb)
    // await pullData()
  } catch (error) {
    console.log(error)
    isSyncing = false
  }
}

async function syncNextData (pushDataToWeb: (data: any) => Promise<{ message: string }>) {
  if (syncDataArray.length > 0) {
    const dataToSync = syncDataArray[0]
    console.log('Syncing data: ', dataToSync)

    // push data to web
    const res = await pushDataToWeb(dataToSync)

    // if success
    if (res.message === 'success') {
      await syncShift()
    }
    await syncNextData(pushDataToWeb)
  } else {
    isSyncing = false
  }
}

async function pushDataToWeb (data: any) {
  console.log('Push data to web.')
  return { message: 'success' }
}

export async function syncFilePush (...args: any[]) {
  const params = {
    id: 'id',
    createdBy: ''
  }
  return aspectPush(params, syncFileDataArray, dataSyncUpdate, ...args)
}

async function syncFileShift () {
  const params = {
    id: 'id',
    createdBy: ''
  }
  return aspectShift(params, syncFileDataArray, dataSyncUpdate)
}

export async function syncFileData () {
  if (isFileSyncing) return

  if (syncFileDataArray.length === 0) return

  isFileSyncing = true
  try {
    await syncNextFileData(getFileBase64, pushFileToWeb, updateFile)
    // await pullFile()
  } catch (error) {
    console.log(error)
    isFileSyncing = false
  }
}

async function syncNextFileData (getFileBase64: (fileName: string) => Promise<string>, pushFileToWeb: (data: any) => Promise<string>, updateFile: (data: any) => Promise<string>) {
  if (syncFileDataArray.length > 0) {
    const dataToSync = syncFileDataArray[0]
    console.log('Syncing file data: ', dataToSync)

    const fileBase64 = await getFileBase64(dataToSync.name)
    const fileData = {
      ...dataToSync,
      fileBase64
    }

    // push data to web
    const res = await pushFileToWeb(fileData)

    await updateFile({
      ...dataToSync,
      webUrl: res
    })
    // if success
    await syncFileShift()
    await syncNextFileData(getFileBase64, pushFileToWeb, updateFile)
  } else {
    isFileSyncing = false
  }
}

async function getFileBase64 (fileName: string) {
  console.log('Get file base64 data')
  return 'base64'
}

async function pushFileToWeb (data: File) {
  console.log('Push data to web.')
  return 'webUrl'
}

async function updateFile (data: any) {
  console.log('Update web url in file.')
  return 'success'
}

async function initArray () {
  console.log('Init data array.')
  return 'success'
}

async function pullData (getLastPullTime:()=>Promise<string>, pullFromWeb: (lastPullTime: string) => Promise<any>, updateData:(data:any)=>Promise<{ message: 'success'|'fails' }>, updateLastPullTime:(time:string)=>Promise<any>) {
  const time = new Date().getTime().toString()
  const lastPullTime = await getLastPullTime()
  const data = await pullFromWeb(lastPullTime)
  const res = await updateData(data)
  if (res.message === 'success') {
    await updateLastPullTime(time)
  }
  return 'success'
}

async function pullFile (getLastPullFileTime:()=>Promise<string>, pullFileFromWeb: (lastPullTime: string) => Promise<any>, updateFile:(data:any)=>Promise<{ message: 'success'|'fails' }>, updateLastPullTime:(time:string)=>Promise<any>) {
  const time = new Date().getTime().toString()
  const lastPullTime = await getLastPullFileTime()
  const data = await pullFileFromWeb(lastPullTime)
  const res = await updateFile(data)
  if (res.message === 'success') {
    await updateLastPullTime(time)
  }
  return 'success'
}


export async function dataSync () {
  initArray()
  setInterval(syncData, 30 * 1000)
  setInterval(syncFileData, 30 * 1000)
}
