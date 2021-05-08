import React, {useContext, useEffect, useLayoutEffect, useState} from "react";
import styled, {ThemeContext} from "styled-components/native";
import {createMessage, DB, getCurrentUser} from "../utils/firebase";
import {GiftedChat, Send} from "react-native-gifted-chat";
import {MaterialIcons} from "@expo/vector-icons";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const SendButton = props => {
    const theme = useContext(ThemeContext);
    return (
        <Send
            {...props}
            disabled={!props.text}
            containerStyle={{width:44, height:44, alignItems:'center', justifyContent:'center', marginHorizontal:4}}
        >
            <MaterialIcons name="send" size={24} color={props.text ? theme.sendButtonActivate : theme.sendButtonInactivate} />
        </Send>
    )
}

const Channel = ({navigation, route:{params}}) => {
    const theme = useContext(ThemeContext);
    const {uid, name, photoUrl} = getCurrentUser();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const unsubscribe = DB.collection('channels')
            .doc(params.id)
            .collection('messages')
            .orderBy('createdAt', 'desc')// 최신 데이터를 받아오기 위해 createdAt 필드값의 내림차순으로 정렬
            .onSnapshot(snapshot => {// 수신 대기 상태는 언마운트 시 꼭 해제해야한다.
                const list = [];
                snapshot.forEach(doc => {
                    list.push(doc.data());
                });
                setMessages(list);
            });

        return () => unsubscribe();
    }, []);

    useLayoutEffect(()=> {
        navigation.setOptions({headerTitle:params.title || 'Channel'}); // 체널 화면의 헤더 타이틀을 채널의 이름이 렌더링되도록 하여 사용자가 대환하는 채널을 인지 할 수 있도록 수정.
    },[])

    const _handleMessageSend= async messageList => {
        const newMessage = messageList[0];
        try{
            await  createMessage({channelId:params.id, message:newMessage});
        }catch (e) {
            Alert.alert('Send Message Error', e.message);
        }
    };

    /*
    * 메시지가 저장될 messages 컬렉션이 위치한 채널 문서를 찾기 위해 채널 문서의 ID 를 전달받도록 함
    * add 함수를 이용하여 문서의 내용만 전달하면 파이어베이스에서 자동으로 문서의 ID 를 생성하여 적용
    *
    * 채팅 애플리케이션에서 메시지를 주고받는 화면은 최신 데이터가 가장 아래에 나타나고 스크롤의 방향은 위로 올라가도록 화면이 구성된다.
    * FlatList 컴포넌트를 이용하여 아래부터 데이터를 렌더링하려면 inverted 속성을 사용한다.
    * 이 값에 따라 FlatList 컴포넌트를 뒤집은 것처럼 스크롤 방향이 변경된다.
    */

  return (
    <Container>
        <GiftedChat
            listViewProps={{style:{backgroundColor:theme.background}}}
            placeholder="Enter a message..."
            messages={messages} user={{_id:uid, name, avatar:photoUrl}}
            onSend={_handleMessageSend}
            alwaysShowSend={true}
            textInputProps={{autoCapitalize:'none', autoCorrect:false, textContentType:'none', underlineColorAndroid:'transparent'}}
            multiline={false}
            renderusernameOnMessage={true}
            scrollToBottom={true}
            renderSend={props => <SendButton {...props} />}
        />
    </Container>
  );
};

export default Channel;
