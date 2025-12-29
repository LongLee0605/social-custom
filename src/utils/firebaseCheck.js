import { db } from '../config/firebase'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'

export const checkFirestoreConnection = async () => {
  try {
    const testDocRef = doc(db, '_test', 'connection')
    await getDoc(testDocRef)
    
    await setDoc(testDocRef, { 
      timestamp: new Date().toISOString(),
      test: true 
    })
    
    await deleteDoc(testDocRef)
    
    return { 
      success: true, 
      message: 'Kết nối Firestore thành công!' 
    }
  } catch (error) {
    console.error('Firestore connection error:', error)
    
    let message = 'Không thể kết nối với Firestore. '
    
    if (error.code === 'permission-denied') {
      message += 'Lỗi quyền truy cập. Vui lòng kiểm tra Security Rules trong Firebase Console.'
    } else if (error.code === 'unavailable') {
      message += 'Firestore không khả dụng. Vui lòng kiểm tra kết nối internet và cấu hình Firebase.'
    } else {
      message += `Lỗi: ${error.message}`
    }
    
    return { 
      success: false, 
      message 
    }
  }
}

export const checkAllFirebaseServices = async () => {
  const firestore = await checkFirestoreConnection()
  
  return {
    firestore,
    auth: true,
  }
}
