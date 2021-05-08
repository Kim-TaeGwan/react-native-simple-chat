import React, { useState, forwardRef } from "react";
import styled from "styled-components/native";
import PropTypes from "prop-types";

const Container = styled.View`
  flex-direction: column;
  width: 100%;
  margin: 10px 0;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: ${({ theme, isFocused }) => (isFocused ? theme.text : theme.label)};
`;

const StyleTextInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.inputPlaceholder,
}))`
  background-color: ${({ theme, editable }) =>
    editable ? theme.background : theme.inputDisabledBackground};
  color: ${({ theme }) => theme.text};
  padding: 20px 10px;
  font-size: 16px;
  border: 1px solid
    ${({ theme, isFocused }) => (isFocused ? theme.text : theme.label)};
  border-radius: 4px;
`;

const Input = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      onSubmitEditing,
      onBlur,
      placeholder,
      isPassword,
      returnKeyType,
      maxLength,
      disabled,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <Container>
        <Label isFocusd={isFocused}>{label}</Label>
        <StyleTextInput
          ref={ref}
          isFocusd={isFocused}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing} // text submit 버튼 누를시 작동
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // text 입력이 흐려질때
            setIsFocused(true);
            onBlur();
          }}
          placeholder={placeholder}
          secureTextEntry={isPassword} // 입력되느 문자를 감추는 기능으로 비밀번호를 입력하는 곳에서 많이 사용
          returnKeyType={returnKeyType}
          maxLength={maxLength}
          autoCapitlize="none" // 자동 대문자
          autoCorrect={false} // 자동 수정
          textContentType="none" // ios only
          underlineColorAndroid="transparent" // Android only
          disabled={!disabled} // 사용 가능 여부
        />
      </Container>
    );
  }
);

Input.defaultProps = {
  onBlur: () => {},
  onChangeText: () => {},
  onSubmitEditing: () => {},
};
Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  isPassword: PropTypes.bool,
  returnKeyType: PropTypes.oneOf(["done", "next"]),
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
};

export default Input;
