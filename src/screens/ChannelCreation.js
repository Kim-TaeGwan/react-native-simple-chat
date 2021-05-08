import React, {useContext, useEffect, useRef, useState} from "react";
import styled from "styled-components/native";
import {Input,Button} from "../components";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {ProgressContext} from "../contexts";
import {createChannel} from "../utils/firebase";
import {Alert} from "react-native";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  justify-content: center;
  align-items: center;
  padding:0 20px;
`;

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color:${({theme}) => theme.errorText}
`

const ChannelCreation = ({navigation}) => {
    const [title, setTitle] = useState('');
    const [description,setDescription] = useState('');
    const descriptionRef = useRef();
    const [errorMessage, setErrorMessage] = useState('');
    const [disabled, setDisabled] = useState(true);
    const {spinner} = useContext(ProgressContext);

    useEffect(()=>{
        setDisabled(!(title && !errorMessage))
    },[title,errorMessage,disabled])

    const _handleTitleChange = (title) => {
        setTitle(title);
        setErrorMessage(title.trim() ? '' : 'Please enter the title.');
    }

    const _handleCreateButtonPress = async () => {
        /*
        * 채널 생성이 완료되면 채널 생성 화면을 남겨놓은 상태에서 생성된 채널로 이동하는 것이 아니라,
        * 채널 생성 화면을 제거하고 새로 생성된 채널로 이동하는 것이 일반적이다.
        * 채널 생성 화면에서도 동일하게 동작하도록 navigation 의 replace 함수를 이용.
        * replace 함수는 navigate 함수처럼 화면을 이동하지만, 현재 화면을 스택에 유지하지 않고 새로운 화면과 교체하면서 화면을 이동한다는 특징이 있다.
        *
        * 채널 생성되는 동안 사용자의 추가 행동을 방지하기 위해 ProgressContext 를 이용하여 Spinner 컴포넌트가 렌더링되도록 하고,
        * 채널 생성이 완료되면 채널 화면으로 이동하면서 현재 입장하는 채널의 ID 와 제목을 params 로 함께 전달
        */
        try{
            spinner.start()
            const id = await createChannel({title, description});
            navigation.replace('Channel', {id, title})
        }catch(e){
            Alert.alert('Creation Error',e.message)
        }finally {
            spinner.stop()
        }
    }

  return (
      <KeyboardAwareScrollView contentContainerStyle={{flex:1}} extraScrollHeight={20}>
        <Container>
            <Input label="Title" value={title} onChangeText={_handleTitleChange} onSubmitEditing={()=> {
            setTitle(title.trim());
            descriptionRef.current.focus();
            }}
            onBlur={()=>setTitle(title.trim())}
            placeholder="Title"
            returnKeyType="next"
            maxLength={20}
            />
            <Input label="Description" ref={descriptionRef} value={description} onChangeText={text => setDescription(text)} onSubmitEditing={()=> {
                setDescription(description.trim());
                _handleCreateButtonPress();
            }}
            onBlur={()=>setDescription(description.trim())}
            placeholder="Description"
            returnKeyType="done"
            maxLength={40}
            />
            <ErrorText>{errorMessage}</ErrorText>
          <Button title="Create" onPress={_handleCreateButtonPress} disabled={disabled} />
        </Container>
      </KeyboardAwareScrollView>
  );
};

export default ChannelCreation;
