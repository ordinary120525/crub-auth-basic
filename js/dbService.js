// Firebase 데이터베이스 객체(db)를 불러옴
import { db } from "./firebase.js";
// Firebase에서 사용할 여러 함수들을 불러옴
import {
  collection, // 컬렉션을 참조하기 위한 함수
  addDoc, // 새 문서를 추가하기 위한 함수
  deleteDoc, // 기존 문서를 삭제하기 위한 함수
  updateDoc, // 기존 문서를 업데이트하기 위한 함수
  doc, // 특정 문서를 참조하기 위한 함수
  getDocs, // 여러 문서를 조회하기 위한 함수
  serverTimestamp, // 서버 시간을 타임스탬프로 기록하기 위한 함수
  orderBy, // 쿼리 결과를 정렬하기 위한 함수
  query, // Firestore 쿼리를 작성하기 위한 함수
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 게시물 조회 함수
export const fetchPosts = async () => {
  const posts = []; // 조회된 게시물들을 저장할 배열을 초기화

  // posts 컬렉션에서 createdAt 필드를 기준으로 내림차순 정렬하는 쿼리 생성
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  try {
    // Firebase에서 쿼리에 해당하는 모든 문서를 가져옴
    const querySnapshot = await getDocs(q);

    // 가져온 문서에 대해 반복문 실행
    querySnapshot.forEach((doc) => {
      // 각 문서를 posts 배열에 추가, id와 데이터를 병합하여 저장
      posts.push({
        id: doc.id, // 문서의 고유 ID 저장
        ...doc.data(), // 문서의 나머지 데이터를 스프레드 문법으로 병합
        createdAt: doc.data().createdAt // createAt 필드가 존재할 경우
          ? new Date(doc.data().createdAt.seconds * 1000).toLocaleString() // 타임스탬프를 사람이 읽을 수 있는 문자열로 변환
          : "유효하지 않은 타임스탬프입니다!",
      });
    });
  } catch (error) {
    console.log("게시물 조회에 실패했습니다!", error);
  }

  // posts 배열을 반환하여 호출한 쪽에서 사용할 수 있게 함
  return posts;
};

// 게시물 추가 함수
export const addPost = async (content) => {
  try {
    // posts 컬렉션에 새로운 문서를 추가
    await addDoc(collection(db, "posts"), {
      content, // 게시물 내용
      author,
      createdAt: serverTimestamp(), // 서버에서 생성된 타임스탬프로 생성 시간 기록
    });
  } catch (error) {
    console.log("게시물 등록에 실패 했습니다!", error);
  }
};

// 게시물 수정 함수
export const updatePost = async (id, updatedContent) => {
  const postRef = doc(db, "posts", id);
  try {
    await updateDoc(postRef, { content: updatedContent });
  } catch (error) {
    console.log("글 수정에 실패하였습니다!", error);
  }
};

// 게시물 삭제 함수
export const deletePost = async (id) => {
  const postRef = doc(db, "posts", id);
  try {
    await deleteDoc(postRef);
  } catch (error) {
    console.log("해당 글 삭제에 실패하였습니다!", error);
  }
};
