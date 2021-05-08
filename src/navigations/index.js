import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { Spinner } from "../components";
import { ProgressContext, UserContext } from "../contexts";
/*
 * UserContext 의 user 상태에 따라 인증 여부를 확인할 수 있음.
 * 인증 여부에 따라 MainStack 내비게이션 혹은 AuthStack 내비게이션이 렌더링 되도록 함
 * */
const Navigation = () => {
  // Spinner 컴포넌트가 ProgressContext 의 inProgress 상태에 따라 렌더링되도록 함.
  const { inProgress } = useContext(ProgressContext);
  const { user } = useContext(UserContext);
  // NavigationContainer 컴포넌트르 사용하고 자식 컴포넌트로 AuthStack 내비게이션을 사용
  return (
    <NavigationContainer>
      {user?.uid && user?.email ? <MainStack /> : <AuthStack />}
      {inProgress && <Spinner />}
    </NavigationContainer>
  );
};

export default Navigation;
