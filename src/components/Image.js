import React, { useEffect } from "react";
import styled from "styled-components/native";
import PropTypes from "prop-types";
import { MaterialIcons } from "@expo/vector-icons";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";

const Container = styled.View`
  align-self: center;
  margin-bottom: 30px;
`;

const StyledImage = styled.Image`
  background-color: ${({ theme }) => theme.imageBackground};
  width: 100px;
  height: 100px;
  border-radius: ${({ rounded }) => (rounded ? 50 : 0)}px;
  // 사용자의 사진을 원형으로 렌더링하기 위해 Image 컴포넌트에서 props를 통해 전달되는 값에 따라 이미지가 원형으로 렌더링되도록 함.
`;

const ButtonContainer = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.imageButtonBackground};
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  justify-content: center;
  align-items: center;
`;

const ButtonIcon = styled(MaterialIcons).attrs({
  name: "photo-camera",
  size: 22,
})`
  color: ${({ theme }) => theme.imageButtonIcon};
`;

const PhotoButton = ({ onPress }) => {
  return (
    <ButtonContainer onPress={onPress}>
      <ButtonIcon />
    </ButtonContainer>
  );
};

const Image = ({ url, imageStyle, rounded, showButton, onChangeImage }) => {
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== "web") {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
          if (status !== "granted") {
            Alert.alert(
              "Photo Permission",
              "Please turn on the camera rll permissions"
            );
          }
        }
      } catch (e) {
        Alert.alert("Photo Permission Error", e.message);
      }
    })();
  }, []);

  /*
   * ios 에서는 사진첩에 접근하기 위해 사용자에게 권한을 요청하는 과정이 필요하므로 권한을 요청하는 부분을 추가함.
   * 안드로이드는 특별한 설정 없이 사진에 접근할 수 있기 때문에 ios 에서만 동작하도록 작성
   * */

  const _handleEditButton = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        /*
         * mediaTypes : 조회하는 자료의 타입
         * allowsEditing : 이미지 선택 후 편집 단계 진행 여부
         * aspect : 안드로이드 전용 옵션으로 이미지 편집 시 사각형의 비율([x,y])
         * quality : 0 ~ 1 사이의 값을 받으며 압축 품질을 의미(1: 최대 품질)
         */
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.cancelled) {
        onChangeImage(result.uri);
      }
      console.log("profileImage", result);
    } catch (e) {
      Alert.alert("Photo Error", e.message);
    }
  };

  return (
    <Container>
      <StyledImage source={{ uri: url }} style={imageStyle} rounded={rounded} />
      {showButton && <PhotoButton onPress={_handleEditButton} />}
    </Container>
  );
};
Image.defaultProps = {
  showButton: false,
  onChangeImage: () => {},
};

Image.propTypes = {
  uri: PropTypes.string,
  imageStyle: PropTypes.object,
  rounded: PropTypes.bool,
  showButton: PropTypes.bool,
  onChangeImage: PropTypes.func,
};

export default Image;
