/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import type {PropsWithChildren} from 'react';
import {NavigationAction, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type PokemonItemAPI = {name: string; url: string; profile: Function};
type ResponsePage = {
  next: string;
  previous: string;
  offset: number;
  limit: number;
};
type Stat = {name: string; base_value: number};
type PokemonProfile = {
  name: string;
  base_experience: number;
  height: number;
  stats: Array<Stat>;
};

const Separator = () => <View style={styles.divider}></View>;
function App(): JSX.Element {
  const Stack = createNativeStackNavigator();
  const isDarkMode = useColorScheme() === 'dark';
  const [dados, setDados] = useState<PokemonItemAPI[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [page, setPage] = useState<ResponsePage>({
    offset: 0,
    limit: 100,
    next: '',
    previous: '',
  });

  const loadMorePokemons = () => {
    setRefreshing(true);
    console.log(page);
    axios
      .get(page.next)
      .then(updatePaginationState)
      .then(response => response.data.results)
      .then(transformedResponse => setDados(dados.concat(transformedResponse)))
      .then(() => setRefreshing(false))
      .catch(e => console.log(e));
  };

  const updatePaginationState = (response: AxiosResponse): AxiosResponse => {
    const data = response.data;
    setPage({
      offset: page.offset + 100,
      next: data.next,
      previous: data.previous || '',
      limit: page.limit,
    });
    return response;
  };

  useEffect(() => {
    const offset = page.offset;
    const limit = page.limit;
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}}`)
      .then(updatePaginationState)
      .then(response => response.data.results)
      .then(transformedResponse => setDados(transformedResponse))
      .then(() => setRefreshing(false))
      .catch(e => console.log(e));
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const FooterComponent = () => {
    if (refreshing) {
      return <ActivityIndicator size={'large'} color={'#000'} />;
    } else {
      return null;
    }
  };

  const PokemonItem = (props: PokemonItemAPI) => {
    return (
      <Pressable style={styles.itemContainer} onPress={() => props.profile()}>
        <Text style={styles.header}>{props.name}</Text>
        <Text style={styles.item} numberOfLines={1}>
          {props.url}
        </Text>
      </Pressable>
    );
  };

  const PokemonProfileScreen = ({
    navigation,
    route,
  }: {
    navigation: any;
    route: any;
  }) => {
    const [profile, setProfile] = useState<PokemonProfile>();

    const newProfileFromResponse = (
      response: AxiosResponse,
    ): PokemonProfile => {
      const data = response.data;
      const stats = response.data.stats.map(
        (stat: any): Stat => ({
          base_value: stat.base_stat,
          name: stat.stat?.name,
        }),
      );
      return {
        name: data.name,
        base_experience: data.base_experience,
        height: data.height,
        stats: stats,
      };
    };

    useEffect(() => {
      const pokemonUrl = route.params?.url;

      axios
        .get(pokemonUrl)
        .then(newProfileFromResponse)
        .then(setProfile)
        .catch(console.log);
    }, []);

    return (
      <View style={profileStyles.profileContainer}>
        <Text style={profileStyles.profileHeader}>
          {profile?.name.toLocaleUpperCase()}
        </Text>
        <Separator />
        <View style={profileStyles.attributes}>
          <View style={profileStyles.attributeContainer}>
            <Text style={profileStyles.attributeTitle}>Base Experience</Text>
            <Text style={profileStyles.attributeValue}>
              {profile?.base_experience}
            </Text>
          </View>
          <View style={profileStyles.attributeContainer}>
            <Text style={profileStyles.attributeTitle}>Height</Text>
            <Text style={profileStyles.attributeValue}>
              {profile?.base_experience}
            </Text>
          </View>
        </View>

        <FlatList
          data={profile?.stats}
          renderItem={({item}) => (
            <View>
              <View style={profileStyles.statItem}>
                <Text>{item.name}</Text>
                <Text>{item.base_value}</Text>
              </View>
              <Separator />
            </View>
          )}
        />
      </View>
    );
  };
  const HomeScreen = ({navigation}: {navigation: any}) => {
    return (
      <SafeAreaView style={backgroundStyle}>
        <FlatList
          style={styles.contentList}
          refreshing={refreshing}
          data={dados}
          numColumns={2}
          onEndReached={loadMorePokemons}
          keyExtractor={(item, index) => `pokemon_window_${index}`}
          ListFooterComponent={FooterComponent}
          renderItem={({item}) => (
            <PokemonItem
              name={item.name}
              url={item.url}
              profile={() =>
                navigation.navigate('PokemonProfile', {url: item.url})
              }
            />
          )}
        />
      </SafeAreaView>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="PokemonProfile" component={PokemonProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  divider: {
    borderBottomColor: 'black',
    margin: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  item: {
    backgroundColor: '#c1a',
    color: '#FFF',
    fontSize: 16,
    flex: 1,
  },
  header: {
    backgroundColor: '#BBB',
    color: '#000',
    textShadowColor: '#00F',
    textShadowOffset: {width: 5, height: 5},
    textShadowRadius: 10,
    fontWeight: 'bold',
    fontSize: 32,
    flex: 1,
  },
  itemContainer: {
    flex: 1,
    borderWidth: 2,
    flexDirection: 'column',
  },
  contentList: {
    flexDirection: 'column',
  },
});
const profileStyles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'column',
  },
  profileHeader: {
    fontSize: 46,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textAlign: 'center',
  },
  attributes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attributeContainer: {
    flexDirection: 'column',
    margin: 12,
    padding: 6,
  },
  attributeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  attributeValue: {
    fontSize: 18,
    textShadowColor: 'black',
    textShadowOffset: {
      width: 4,
      height: 4,
    },
    textShadowRadius: 6,
    fontWeight: 'bold',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
export default App;
