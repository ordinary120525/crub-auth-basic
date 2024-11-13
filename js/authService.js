import { auth, googleProvider } from "./firebase.js";
// Firebase Auth에서 사용할 여러 함수들을 불러옴
import {
  createUserWithEmailAndPassword, // 이메일과 비밀번호로 새로운 사용자 생성
  signInWithEmailAndPassword, // 이메일과 비밀번호로 사용자 로그인
  signInWithPopup, // 팝업을 이용한 로그인 (구글 로그인)
  GoogleAuthProvider, // 구글 인증 제공자를 정의
  onAuthStateChanged, // 인증 상태 변화를 감지하는 함수
  signOut, // 사용자 로그아웃
  sendEmailVerification, // 이메일 인증 전송 함수
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 회원가입 함수, 이메일 인증 포함
export const signUp = async (email, password, messageElement) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user);

    messageElement.style.color = "green";
    messageElement.textContent =
      "회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요!";
    console.log(
      "회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요!"
    );
  } catch (error) {
    messageElement.style.color = "red";
    messageElement.textContent =
      "회원가입에 실패 하였습니다! 다시 시도해주세요!";
    console.log("회원가입에 실패 하였습니다! 다시 시도해주세요!", error);
  }
};

// 로그인 함수, 이메일 인증 확인 포함
export const signIn = async (
  email,
  password,
  messageElement,
  authSection,
  newPostSection,
  logoutButton
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // 이메일 인증 여부 확인
    if (!userCredential.user.emailVerified) {
      // 이메일 인증이 완료되지 않았을 때 메세지 출력
      messageElement.style.color = "red";
      messageElement.textContent =
        "이메일 인증이 완료되지 않았습니다! 이메일을 확인 후 인증을 완료해주세요!";
      return false; // 인증되지 않은 사용자
    }

    // 인증된 사용자만 로그인 상태 유지
    authSection.classList.add("hidden");
    logoutButton.classList.remove("hidden");
    newPostSection.classList.remove("hidden");
    messageElement.style.color = "black";
    messageElement.textContent = `환영합니다! ${userCredential.user.email}님!`;
    return true; // 인증된 사용자
  } catch (error) {
    messageElement.style.color = "red";
    messageElement.textContent = "로그인에 실패하였습니다! 다시 시도해주세요!";
    console.log("로그인 오류", error);
    return false; // 인증되지 않은 사용자
  }
};

// 구글 로그인 함수
export const googleSignIn = async (messageElement) => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    messageElement.style.color = "red";
    messageElement.textContent = "로그인에 실패하였습니다! 다시 시도해주세요!";
    console.log("로그인 오류", error);
  }
};

// 로그아웃 함수
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 완료");
  } catch (error) {
    console.log("로그아웃 오류", error);
  }
};

// 인증 상태 변경 감지 함수
export const observeAuthState = (callback) => {
  onAuthStateChanged(auth, callback);
};
