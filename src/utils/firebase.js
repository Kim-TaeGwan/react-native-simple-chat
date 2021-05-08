import * as firebase from "firebase";
import config from "../../firebase.json";
import 'firebase/firestore';

// 연동
const app = firebase.initializeApp(config);

const Auth = app.auth();

/*
 * 사용자 이름은 문자열로 입력할 수 있지만. 사진은 약간의 변화가 필요하다. 라이브러리를 이용해서 받은 선택된 사진은 "file://..." 로 진행되는 값을 갖고 있어 바로 사용할 수 없다.
 * 이 문제는 사용자에 의해 선택된 사진을 스토리지에 업로드하고 업로드된 사진의 url 을 이용하는 방법으로 해결할 수 있다.
 */

/*
 * 사진을 스토리지에 업로드하는 함수를 만들고 signup 함수를수정해서 생성되는 사용자의 사진과 이름을 설정하도록 함.
 * 스토리지에 업로드할때, 현재 인증된 사용자의 정보를 담은 currentUser 의 uid 를 이용해 사진이 저장될 주소를 구분하도록 함.
 * 이렇게 사용자의 uid 를 이용해서 파일이 저장되는 주소를 지정하면 규칙 수정을 통해 파일의 접근 권한을 설정하기 쉬울 뿐 아니라, 해당 사용자의 사진을 쉽게 찾을수 있다는 장점이 있다.
 */

const uploadImage = async (uri) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const user = Auth.currentUser;
  const ref = app.storage().ref(`/profile/${user.uid}/photo.png`); // 스토리지에 업로드할때, 현재 인증된 사용자의 정보를 담은 currentUser 의 uid 를 이용해 사진이 저장될 주소를 구분하도록 함.
  const snapshot = await ref.put(blob, { contextType: "image/png" });

  blob.close();
  return await snapshot.ref.getDownloadURL();
};
/*
 * 이메일과 비밀번호를 이용해서 인증받는 함수는 signInWithEmailAndPassword 이다.
 * 함수의 이름은 길지만, 그만큼 역할을 명확하게 알 수 있다는 것이 장점이다.
 *
 * 사용자의 이름과 선택된 사진 주소를 추가로 전달받도록 수정.
 * 사용자가 사진을 선택하지 않고 진행할 경우, 앞에서 스토리지에 업로드 한 기본 이미지의 주소를 갖고 있으므로 업로드를 따로 진행하지 않도록 작성
 */

// 회원가입
export const signup = async ({ email, password, photoUrl, name }) => {
  const { user } = await Auth.createUserWithEmailAndPassword(email, password);
  const storageUrl = photoUrl.startsWith("https")
    ? photoUrl
    : await uploadImage(photoUrl);
  await user.updateProfile({
    displayName: name,
    photoURL: storageUrl,
  });
  return user;
};

// 로그인
export const login = async ({ email, password }) => {
  const { user } = await Auth.signInWithEmailAndPassword(email, password);
  return user;
};

// 로그아웃
export const logout = async () => {
  return await Auth.signOut();
};

// 현재 접속한 사용자의 정보를 반환
export const getCurrentUser = () => {
  const { uid, displayName, email, photoURL } = Auth.currentUser;
  return { uid, name: displayName, email, photoUrl: photoURL };
};

// 사용자의 사진을 수정
export const updateUserPhoto = async (photoUrl) => {
  const user = Auth.currentUser;
  const storageUrl = photoUrl.startsWith("https")
    ? photoUrl
    : await uploadImage(photoUrl);
  await user.updateProfile({ photoURL: storageUrl });
  return { name: user.displayName, email: user.email, photoUrl: user.photoURL };
};

// 채널 데이터 베이스
/*
* 컬렉션에서 문서를 생성할 때 ID 를 지정하지 않으면 파이어스토어에서 자동으로 중복되지 않는 ID 를 생성해 문서의 ID 로 사용.
* 자동으로 생성된 문서의 ID 는 문서의 필드로도 저장하고, 사용자에게 입력받은 채널의 제목과 설명을 필드로 사용
* 마지막으로 채널이 생성된 시간을 함수가 호출된 시점의 타임스탬프로 저장하도록 작성
*/
export const DB = firebase.firestore();

export const createChannel = async ({ title, description }) => {
  const newChannelRef = DB.collection('channels').doc();
  const id = newChannelRef.id;
  const newChannel = {
    id,
    title,
    description,
    createdAt: Date.now(),
  };
  await newChannelRef.set(newChannel);
  return id;
};

// 메시지 생성, 메시지를 전송
export const createMessage = async ({ channelId, message }) => {
  return await DB.collection('channels')
      .doc(channelId)
      .collection('messages')
      .doc(message._id)
      .set({
        ...message,
        createdAt: Date.now(),
      });
};
