import React, { useRef, useState, useEffect, useContext } from "react";
import styled from "styled-components/native";
import { Image, Input, Button } from "../components";
import { images } from "../utils/images";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { removeWhitespace, validateEmail } from "../utils/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { login } from "../utils/firebase";
import { ProgressContext, UserContext } from "../contexts";

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  padding: 0 20px;
  padding-top: ${({ insets: { top } }) => top}px;
  padding-top: ${({ insets: { bottom } }) => bottom}px;
`;
/*
 * SafeAreaView 컴포넌트를 이용하는 방법 외에도 노치 디자인에 대응하기 위해 스타일을 설정해야 하는 padding 값을 얻는 방법이 있다.
 * react-native-safe-area-context 라이브러리가 제공하는 useSafeAreaInsets Hook 함수를 이용하면 된다.
 * 노치 디자인을 해결하기 위해 padding의 top 과 bottom 의 값을 useSafeAreaInsets 함수가 알려주는 값만큼 설정하고,
 * 양 옆은 디자인에 맞게 20px 로 설정했다.
 * useSafeAreaInsets 함수의 장점은 ios 뿐만 아니라 안드로이드에서도 적용 가능한 padding 값을 전달한다는 점이다.
 *
 * 이렇게 useSafeAreaInsets 를 사용하면 조금 더 세밀하게, 원하는 곳에 원하는 만큼 padding 을 설정해서 노치 디자인 문제를 해결할 수 있다는 장점이 있다.
 */

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const Login = ({ navigation }) => {
  const { dispatch } = useContext(UserContext);
  const { spinner } = useContext(ProgressContext);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef();
  const [errorMessage, setErrorMessage] = useState("");
  const [disabled, setDisabled] = useState(true);
  /*
   * useRef 를 이용해 이메일을 입력받는 Input 컴포넌트에서 키보드의 next 버튼을 클릭하면 비밀번호를 입력하는 Input 컴포넌트로 포커스가 이동
   * 이메일을 입력하는 Input 컴포넌트의 onSubmitEditing 함수를 passwordRef 를 이용해서 비밀번호를 입력하는 Input 컴포넌트로 포커스가 이동하도록 함.
   *
   * Input 컴포넌트에 전달된 ref 를 이용해 TextInput 컴포넌트의 ref 로 지정해야 한다
   * 하지만 ref 는 key 처럼 리액트에서 특별히 관리되기 때문에 자식 컴포넌트의 props 로 전달되지 않는다.
   * 이런 상황에서 forwardRef 함수를 이용하면 ref 를 전달받을 수 있다.
   *
   * 리액트 네이티브에서 제공하는 기능으로 다른 영역을 터치했을 때 키보드를 감추는 기능을 만들기 위해서는
   * TouchableWithoutFeedback 컴포넌트와 keyboard API 를 이용한다.
   * TouchableWithoutFeedback 컴포넌트는 클릭에 대해 상호 작용은 하지만 스타일 속성이 없고 반드시 하나의 자식 컴포넌트를 가져야 하는 특징이 있다.
   * keyboard API 는 리액트 네이티브에서 제공하는 키보드 관련 API 로 키보드 상태에 따른 이벤트 등록에 많이 사용되며,
   * keyboard API 에서 제공하는 dismiss 함수는 활성화된 키보드를 닫는 기능이다.
   *
   * TouchableWithoutFeedback 컴포넌트와 keyboard API 를 이용해서 만든 화면은 입력도중 다른 영역을 터치할 경우 키보드가 사라지는 것을 볼수 있다.
   * 하지만 위치에 따라 키보드가 Input 컴포넌트를 가리는 문제는 해결하지 못한다.
   *
   * react-native-keyboard-aware-scroll-view 라이브러리를 이용하면 이런 고민을 쉽게 해결할 수 있다.
   * react-native-keyboard-aware-scroll-view 라이브러리는 포커스가 있는 TextInput 컴포넌트의 위치로 자동 스크롤되는 기능 등 Input 컴포넌트에 필요한 기능등을 제공한다.
   *
   */

  useEffect(() => {
    // 로그인 버튼은 이메일과 비밀번호가 입력되어 있고, 오류 메시지가 없는 상태에서만 활성화
    setDisabled(!(email && password && !errorMessage));
  }, [email, password, errorMessage]);

  const _handleEmailChange = (email) => {
    const changeEmail = removeWhitespace(email);
    setEmail(changeEmail);
    setErrorMessage(
      validateEmail(changeEmail) ? "" : "Please verify your email."
    );
  };

  const _handlePasswordChange = (password) => {
    setPassword(removeWhitespace(password));
  };

  const _handleLoginButtonPress = async () => {
    try {
      spinner.start();
      const user = await login({ email, password });
      dispatch(user); // 로그인에 성공하면 UserContext 의 dispatch 함수를 이용해 user 의 상태가 인증된 사용자 정보로 변경됨
      // Alert.alert("Login Success", user.email);
    } catch (e) {
      Alert.alert("Login Error", e.message);
    } finally {
      spinner.stop();
    }
  };

  /*
   * 이메일에는 공백이 존재하지 않으므로 email 의 값이 변경될 때마다 공백을 제거하도록 수정하고, validateEmail 함수를 이용해 공백이 제거된 이메일이 올바른 형식인지 검사
   * 검사 결과에 따라 오류 메시지가 나타나도록 로그인 화면을 수정
   * 비밀번호도 공백을 허용하지 않기 위해 공백을 제거하는 코드가 추가
   */

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1 }}
      extraScrollHeight={20} // 원하는 위치로 스크롤되도록 설정
    >
      <Container insets={insets}>
        <Image url={images.logo} imageStyle={{ borderRadius: 8 }} />
        <Input
          label="Email"
          value={email}
          onChangeText={_handleEmailChange}
          onSubmitEditing={() => passwordRef.current.focus()}
          placeholder="Email"
          returnKeyType="next"
        />
        <Input
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={_handlePasswordChange}
          onSubmitEditing={_handleLoginButtonPress}
          placeholder="Password"
          returnKeyType="done"
          isPassword
        />
        <ErrorText>{errorMessage}</ErrorText>
        <Button
          title="Login"
          onPress={_handleLoginButtonPress}
          disabled={disabled}
        />
        <Button
          title="Sign up with email"
          onPress={() => navigation.navigate("Signup")}
          isFilled={false}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default Login;
