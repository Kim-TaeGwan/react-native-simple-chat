/*
 * 주소의 쿼리 스트링에서 token 부분을 제외하고 사용해아한다.
 * 쿼리 스트링에 있는 token 은 현재 로그인된 사용자에게 발급된 값이다.
 * 실제 사용할 때는 token 이 변경될 뿐만 아니라, 로그인 화면에서는 아직 로그인 전이므로 toekn 이 없는 상태로 접근이 가능해야 한다.
 * */

const prefix =
  "https://firebasestorage.googleapis.com/v0/b/react-native-simple-chat-ba616.appspot.com/o";

export const images = {
  logo: `${prefix}/logo.png?alt=media`,
  photo: `${prefix}/photo.png?alt=media`,
};
