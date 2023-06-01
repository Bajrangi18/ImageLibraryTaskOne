import { View,ScrollView,FlatList,Text,Image,Keyboard,Dimensions,Pressable,ActivityIndicator,Modal } from "react-native"
import { useState,useEffect,useRef } from "react"
import { TextInput } from "react-native-paper"
import searchIcon from './Helpers/dismiss.png'
import ImageViewer from 'react-native-image-zoom-viewer'


interface urlHolder {
    url:string,
    index:number
}

const SearchPage = ({navigation,setShowHead,netHolder}) => {
    const inputRef = useRef(null);
    const [imageUrls,setImageUrls] = useState<urlHolder[]>([])
    const [search,setSearch] = useState("")
    const [indexPos,setIndexPos] = useState(0)
    const [modalVisible,setModalVisible] = useState(false)
    const [loading,setLoading] = useState(false)


    const numColumns = 3;
    const screenWidth = Dimensions.get('window').width*0.98;
    const itemWidth = screenWidth / numColumns;

    const callData = () => {
        setLoading(true)
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
          };
          
          fetch(`https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s&text=${search}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                for(let [ind,val] of JSON.parse(result).photos.photo.entries()){
                    let obj:urlHolder = {url:val.url_s,index:ind}
                    setImageUrls(prev=>[...prev,obj])
                }
            })
            .then(()=>{setLoading(false)})
            .catch(error => {
                console.log('error', error);
                setLoading(false)
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
        <View style={{justifyContent: 'flex-start',alignItems: 'center',backgroundColor:'black',height:"100%"}}>
                    <Modal onRequestClose={()=>{setModalVisible(false);setShowHead(true);setIndexPos(0)}} visible={modalVisible} transparent={true} style={{height:Dimensions.get("window").height,width:Dimensions.get("window").width,justifyContent:'center',alignItems:'center'}}  >
                        <View style={{height:"5%",width:"100%",backgroundColor:'black',justifyContent:'flex-start',flexDirection:'row',alignItems:'center'}}>
                            <Pressable onPress={()=>{setModalVisible(false);setShowHead(true);setIndexPos(0)}} style={{justifyContent:'center',marginLeft:15,alignItems:'center'}}>
                            <Image source={require("./Helpers/backButton.png")} style={{height:26,width:26,tintColor:'white'}}/>
                            </Pressable>
                            <Text style={{fontSize:18.5,color:'white',marginLeft:20}}>{indexPos+1} / {imageUrls.length}</Text>
                        </View>
                        <ImageViewer style={{width:"100%",height:"95%"}} onChange={(index)=>{setIndexPos(index!)}} imageUrls={imageUrls} useNativeDriver={true} enablePreload={true} index={indexPos} renderIndicator={()=><View/>}/>
                    </Modal>

        <TextInput
        ref={inputRef}
        placeholder="Type Here to Search" 
        value={search}
        onChangeText={(search)=>setSearch(search)}
        mode="outlined"
        style={{width:"90%",backgroundColor:'black',marginBottom:20}}
        activeOutlineColor="white"
        outlineColor="rgba(255,255,255,0.7)"
        placeholderTextColor={"rgba(255,255,255,0.7)"}
        textColor="white"
        outlineStyle={{borderRadius:10}}
        right={search?<TextInput.Icon icon={searchIcon} iconColor="white" onPress={()=>{setSearch("");Keyboard.dismiss();setImageUrls([])}} />:<></>}
        onSubmitEditing={()=>{if(search){callData()}}}
        />
        <ScrollView>
        {imageUrls.length!=0?
        <FlatList 
        data={imageUrls}
        renderItem={({item})=><Item imageUrl={item}/>}
        keyExtractor={(item,index) => index.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={{flex: 1,flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}
        />:<></>}
        {loading?<View style={{width:"100%"}}><Text style={{fontSize:18,color:"white"}}>Loading</Text><ActivityIndicator size="large" color="white"/></View>:<></>}
        </ScrollView>
        </View>
    )
}
export default SearchPage