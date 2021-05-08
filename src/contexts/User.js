import React, { createContext, useState } from "react";

// 사용자의 이메일과 uid 를 가진 user 객체와 user 객체를 수정할 수 있는 dispatch 함수를 value 로 전달하는 UserProvider 컴포넌트를 만듬.
const UserContext = createContext({
  user: { email: null, uid: null },
  dispatch: () => {},
});

const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const dispatch = ({ email, uid }) => {
    setUser({ email, uid });
  };
  const value = { user, dispatch };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
