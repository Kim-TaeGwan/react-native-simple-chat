import React, {useContext, useEffect, useState} from "react";
import {FlatList} from "react-native";
import styled, {ThemeContext} from "styled-components/native";
import {MaterialIcons} from "@expo/vector-icons";
import {DB} from "../utils/firebase";
import moment from "moment";

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-bottom-width:1px;
  border-color:${({theme}) => theme.listBorder};
  padding:15px 20px;
`

const ItemTextcontainer = styled.View`
  flex:1;
  flex-direction: column;
`

const ItemTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
`

const ItemDescription = styled.Text`
font-size: 16px;
  margin-top: 5px;
  color:${({theme}) => theme.listTime};
`

const ItemTime = styled.Text`
  font-size:12px;
    color:${({theme}) => theme.listTime};
`

const getDateOrTime = ts => {
    // 채널이 생성된 날짜가 오늘과 같으면 시간을 렌더링하고, 하루 이상 차이가 나며 생성된 날짜를 렌더링하도록 수정함.
    const now = moment().startOf('day');
    const target = moment(ts).startOf('day');
    return moment(ts).format(now.diff(target, 'days') > 0 ? 'MM/DD' : 'HH:mm');
}



const Item = React.memo(({item: {id, title,description,createAt}, onPress})=> {
    const theme = useContext(ThemeContext);
    console.log(`Item: ${id}`)
    return(
        <ItemContainer onPress={()=> onPress({id, title})}>
            <ItemTextcontainer>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>{description}</ItemDescription>
            </ItemTextcontainer>
            <ItemTime>{getDateOrTime(createAt)}</ItemTime>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={theme.listIcon} />
        </ItemContainer>
    )
})

/*
* 생성한 임의의 데이터를 FlatList 컴포넌트에 항목으로 사용할 데이터로 설정.
* renderItem 에 작성되는 함수는 파라미터로 항목의 데이터를 가진 item 이 포함된 객체가 전달된다.
* 파라미터로 전달되는 데이터를 이용해서 각 항목의 내용을 렌더링하고 클릭 시 채널 화면으로 이동하도록 만듬.
* 마지막으로 각 항목의 id 값을 키로 이용하도록 keyExtractor 를 설정
*
* FlatList 컴포넌트에서 렌더링퇴는 데이터의 수는 windowSize 속성에 의해 결정된다
* windowSize 의 기본값은 21이고, 이 값은 현재 화면(1)과 현재 화면보다 앞쪽에 있는 데이터(10), 그리고 현재 화면보다 뒤쪽에 있는 데이터(10)를 의미한다.
*/

const ChannelList = ({ navigation }) => {
    /*
    * 렌더링할 데이터를 데이터베이스에서 받아온 후 useState 함수를 이용해서 관리할 channels 를 생성하고, 테스트를 위해 생성한 임의의 100개 데이터는 삭제함.
    * 항목의 키도 데이터 베이스에서 받아오온 채널 문서의 ID 를 이용하면서 타입을 변환하는 코드가 필요 없어져 삭제.
    * useEffect 함수를 이용해서 채넉 목록 화면이 마운트 될 때 onSnapshot 함수를 이용하여 데이터베이스에서 데이터를 수신하도록 함.
    *
    * 채널 목록 화면이 마운트될 때 채널 데이터 수신 대기 상태가 되도록 하고, 화면이 언마운트될때 수신 대기 중인 상태를 해제하도록 함.
    * 수신 대기 상태를 해제하지 않으면 다시 채널 목록 화면이 마운트될 때 수신 대기 이벤트가 추가되면서 데이터를 중복으로 받는 문제가 발생하니 주의할 것.
    */
    const [channels,setChannels] = useState([]);

    useEffect(()=>{
        const unsubscribe = DB.collection('channels')
            .orderBy('createAt', 'desc') // 최근에 만들어진 채널이 가장위로 나올 수 있도록 데이터 조회 조건으로 createAt 필드값의 내림차순을 설정.
            .onSnapshot(snapshot => { // onSnapshot 함수는 수신 대기 상태로 있다가 데이터베이스에 문서가 추가되거나 수정될 때마다 지정된 함수가 호출.
                const list = [];
                snapshot.forEach(doc => {
                    list.push(doc.data());
                });
                setChannels(list);
            })
        return ()=> unsubscribe();
    },[])

    const _handleItemPress = params => {
        navigation.navigate('Channel', params);
    }
  return (
    <Container>
        <FlatList keyExtractor={item=>item['id']} data={channels} renderItem={({item})=>(<Item item={item} onPress={_handleItemPress} />)} windowSize={3} />
    </Container>
  );
};

export default ChannelList;
