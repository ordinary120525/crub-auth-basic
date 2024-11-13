import {
  googleSignIn,
  logOut,
  observeAuthState,
  signIn,
  signUp,
} from "./authService.js";
import { fetchPosts, addPost, updatePost, deletePost } from "./dbService.js";
import { auth } from "./firebase.js";

// DOM 요소 참조
const authSection = document.getElementById("auth-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signUpButton = document.getElementById("sign-up-btn");
const signInButton = document.getElementById("sign-in-btn");
const googleSignInButton = document.getElementById("google-sign-in-btn");
const logoutButton = document.getElementById("logout-btn");
const messageElement = document.getElementById("message");
const newPostSection = document.getElementById("new-post-section");
const newPostContent = document.getElementById("new-post-content");
const addPostBtn = document.getElementById("add-post-btn");
const postList = document.getElementById("post-list");

// 사용자 인증 및 로그아웃 관련
signUpButton.addEventListener("click", async () => {
  await signUp(emailInput.value, passwordInput.value, messageElement);
  emailInput.value = "";
  passwordInput.value = "";
});
signInButton.addEventListener("click", async () => {
  await signIn(
    emailInput.value,
    passwordInput.value,
    messageElement,
    authSection,
    newPostSection,
    logoutButton
  );
  emailInput.value = "";
  passwordInput.value = "";
});
googleSignInButton.addEventListener("click", async () => {
  googleSignIn(messageElement);
});
logoutButton.addEventListener("click", async () => await logOut());

// 인증 상태 변경에 따라 UI 업데이트
observeAuthState(async (user) => {
  if (user) {
    // 이메일 인증 여부 확인
    if (user.emailVerified) {
      authSection.classList.add("hidden");
      newPostSection.classList.remove("hidden");
      logoutButton.classList.remove("hidden");
      messageElement.textContent = `환영합니다! ${user.email}님!`;
      renderPosts(user);
    } else {
      newPostSection.classList.add("hidden");
      logoutButton.classList.add("hidden");
    }
  } else {
    authSection.classList.remove("hidden");
    newPostSection.classList.add("hidden");
    logoutButton.classList.add("hidden");
    messageElement.textContent = "";
    renderPosts(null);
  }
});

// 게시물 목록 가져오기 (Read)
// window.addEventListener("load", (user) => {
//  renderPosts(user);
// });

// 게시물 목록 렌더링 함수
const renderPosts = async (user) => {
  postList.innerHTML = "";
  const posts = await fetchPosts();
  posts.forEach((post, index) => {
    const postItem = document.createElement("li");
    postItem.innerHTML = `
     ${index + 1}. ${post.content}<br>
     <span>작성일: ${post.createdAt}</span><br>
     <span>작성자: ${post.author}</span>`;

    if (user && post.author === user.email) {
      const editButton = document.createElement("button");
      editButton.textContent = "수정";
      editButton.addEventListener("click", async () => {
        const updatedContent = prompt(post.content);
        // 수정된 글이 있는지 확인
        if (updatedContent) {
          await updatePost(post.id, updatedContent);
          renderPosts(user);
          console.log(`${index + 1}번 글이 수정되었습니다.`);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", async () => {
        await deletePost(post.id);
        renderPosts(user);
        console.log(`${index + 1}번 글이 삭제되었습니다.`);
      });

      postItem.appendChild(editButton);
      postItem.appendChild(deleteButton);
    }

    postList.appendChild(postItem);
  });
};

// 게시물 추가하기 (Create)
addPostBtn.addEventListener("click", async () => {
  const content = newPostContent.value.trim();
  if (content) {
    await addPost(content, auth.currentUser.email);
    newPostContent.value = "";
    renderPosts(auth.currentUser);
  }
});
