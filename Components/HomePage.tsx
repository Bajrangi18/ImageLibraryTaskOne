import {View,FlatList,Image,Dimensions,Pressable,Text,Modal,ActivityIndicator,ScrollView} from 'react-native'
import { useEffect,useState,useRef,useCallback } from 'react'
import ImageViewer from 'react-native-image-zoom-viewer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native'

interface urlHolder {
  url:string,
  index:number
}
const HomePage = ({navigation,setShowHead,testTry}) => {
  const pageLimiter = 3
  const [page,setPage] = useState(1)
  const [imageUrls,setImageUrls] = useState<urlHolder[]>([])
  const [modalVisible,setModalVisible] = useState(false)
  const [indexPos,setIndexPos] = useState(0)
  const [loading,setLoading] = useState(true)
  const sizeHolder = useRef(0)

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width*0.98;
  const itemWidth = screenWidth / numColumns;


  useFocusEffect(
    useCallback(()=>{
      if(testTry!=null){
        sizeHolder.current = 0
        setPage(testTry?1:pageLimiter)
        console.log("called")
        setImageUrls([])
        callData()    
      } 
    },[testTry])
  )
  
  useEffect(()=>{page<=pageLimiter?setLoading(true):setLoading(false)},[page])

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
    fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=${page.toString()}&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s`, requestOptions)
      .then(response => response.text())
      .then(result => {
        if(tempDataHolder!=JSON.parse(result).photos.photo){
          for(let [ind,val] of JSON.parse(result).photos.photo.entries()){
            console.log(sizeHolder.current,ind,sizeHolder.current,"Main Fetch")
            let obj:urlHolder = {url:val.url_s,index:sizeHolder.current}
            setImageUrls(prev=>[...prev,obj])
            sizeHolder.current = sizeHolder.current + 1
        }
        storeLocalImages(JSON.parse(result).photos.photo)
      }
      })
      .then(()=>setPage(prev=>prev+1))
      .catch(error =>{
        getData()
        .then((jsonHolder)=>{
          for(let [ind,val] of jsonHolder.entries()){
            // console.log(sizeHolder.current,ind,sizeHolder.current+ind,"Local Fetch")
            let obj:urlHolder = {url:val.url_s,index:sizeHolder.current}
            setImageUrls(prev=>[...prev,obj])
            sizeHolder.current = sizeHolder.current + 1
          }  
        })
        .then(()=>{
          setPage(sizeHolder.current>=60?pageLimiter:prev=>prev+1)})
      });
    }

    const Item = ({imageUrl}) => {
      if (!imageUrl.url) {
        return null; // Skip rendering if the url is null
      }
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
        <ScrollView 
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height;
          if (isEndReached && page<=pageLimiter) {
            callData()
          }
        }}
        contentContainerStyle={{alignItems:'center'}}
        >
        <FlatList
        data={imageUrls}
        renderItem={({item})=><Item imageUrl={item}/>}
        keyExtractor={(item,index) => index.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={{flex: 1,flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}/>
        {loading?<ActivityIndicator size="large" color="white" animating={loading}/>:<></>}
        </ScrollView>
        :<View style={{width:"100%"}}>
          <Text style={{fontSize:18,color:"white",width:"100%",textAlign:'center',marginBottom:20}}>Loading</Text>
          <ActivityIndicator size="large" color="white"/>
        </View>}
        </View>
    )
}
export default HomePage