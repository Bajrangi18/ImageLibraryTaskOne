import {View,FlatList,Image,Dimensions,Pressable,Text,Modal,} from 'react-native'
import { useEffect,useState } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';

interface urlHolder {
  url:string,
  index:number
}
const HomePage = ({navigation,setShowHead}) => {
  const netHolder = useNetInfo().isConnected
  const [imageUrls,setImageUrls] = useState<urlHolder[]>([])
  const [modalVisible,setModalVisible] = useState(false)
  const [indexPos,setIndexPos] = useState(0)

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width*0.98;
  const itemWidth = screenWidth / numColumns;
  useEffect(()=>{
    if(netHolder!=null){
      setImageUrls([])
      callData()  
    }
  },[netHolder])
  
  const storeLocalImages = async (value:any) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@image_urls', jsonValue)
    } catch (e) {
      console.log("Caching Save Error")
    }
  }

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@image_urls')
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch(e) {
      console.log("Caching Read Error")
    }
  }

  const callData = async () => {
    const tempDataHolder = await getData()
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    
    fetch("https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s", requestOptions)
      .then(response => response.text())
      .then(result => {
        if(tempDataHolder!=JSON.parse(result).photos.photo){
          for(let [ind,val] of JSON.parse(result).photos.photo.entries()){
          let obj:urlHolder = {url:val.url_s,index:ind}
          setImageUrls(prev=>[...prev,obj])
        }
        storeLocalImages(JSON.parse(result).photos.photo)
      }
      })
      .catch(error =>{
        console.log("here")
        getData()
        .then((jsonHolder)=>{
          for(let [ind,val] of jsonHolder.entries()){
            let obj:urlHolder = {url:val.url_s,index:ind}
            setImageUrls(prev=>[...prev,obj])
          }  
        })
      });
  }

  const Item = ({imageUrl}) => {
    return(
      <View>
        <Pressable onPress={()=>{setShowHead(false);setIndexPos(imageUrl.index);setModalVisible(true);}}>
              <Image source={{uri:imageUrl.url}} style={{width: itemWidth,height: itemWidth,margin: 0.7}} resizeMode="cover" />
        </Pressable>
      </View>
    )
  };

    return(
        <View style={{justifyContent: 'center',alignItems: 'center',backgroundColor:'black',height:"100%"}}>
        <Modal onRequestClose={()=>{setModalVisible(false);setShowHead(true);setIndexPos(0)}} visible={modalVisible} transparent={true} style={{height:Dimensions.get("window").height,width:Dimensions.get("window").width,justifyContent:'center',alignItems:'center'}}  >
          <View style={{height:"5%",width:"100%",backgroundColor:'black',justifyContent:'flex-start',flexDirection:'row',alignItems:'center'}}>
            <Pressable onPress={()=>{setModalVisible(false);setShowHead(true);setIndexPos(0)}} style={{justifyContent:'center',marginLeft:15,alignItems:'center'}}>
              <Image source={require("./Helpers/backButton.png")} style={{height:26,width:26,tintColor:'white'}}/>
            </Pressable>
            <Text style={{fontSize:18.5,color:'white',marginLeft:20}}>{indexPos+1} / {imageUrls.length}</Text>
          </View>
          <ImageViewer style={{width:"100%",height:"95%"}} onChange={(index)=>{setIndexPos(index!)}} imageUrls={imageUrls} useNativeDriver={true} enablePreload={true} index={indexPos} renderIndicator={()=><View/>}/>
        </Modal>
        {imageUrls.length!=0?
        <FlatList
        data={imageUrls}
        renderItem={({item})=><Item imageUrl={item}/>}
        keyExtractor={(item,index) => index.toString()}
        numColumns={numColumns}
        columnWrapperStyle={{flex: 1,flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}/>
        :<View style={{flex:1,width:"100%",justifyContent:'center',alignItems:'center'}}><Text style={{color:'rgba(255,255,255,0.6)',fontSize:18}}>Loading ...</Text></View>}
        </View>
    )
}
export default HomePage