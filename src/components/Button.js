import React from "react";
import styled from "styled-components/native";
import PropTypes from "prop-types";

const TRANSPARENT = "transparent";

const Container = styled.TouchableOpacity`
  background-color: ${({ theme, isFilled }) =>
    isFilled ? theme.buttonBackground : TRANSPARENT};
  align-items: center;
  border-radius: 4px;
  width: 100%;
  padding: 10px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const Title = styled.Text`
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  color: ${({ theme, isFilled }) =>
    isFilled ? theme.buttonTitle : theme.buttonUnfilledTitle};
`;

/*
 * Button 컴포넌트에서 props 를 통해 전달되는 disabled 의 값에 따라 버튼 스타일이 변경되도록 수정.
 * Button 컴포넌트를 구성하는 TouchableOpacity 컴포넌트에 disabled 속성을 전달하면 값에 따라 클릭 등의  상호 작용이 동작하지 않기 때문에
 * disabled 값을 props 로 전달하는 것으로 버튼 비활성화 기능을 추가함.
 * */

const Button = ({ containerStyle, title, onPress, isFilled, disabled }) => {
  return (
    <Container
      style={containerStyle}
      onPress={onPress}
      isFilled={isFilled}
      disabled={disabled}
    >
      <Title isFilled={isFilled}>{title}</Title>
    </Container>
  );
};

Button.defaultProps = {
  isFilled: true,
};

Button.propTypes = {
  containerStyle: PropTypes.object,
  title: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  isFilled: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Button;
