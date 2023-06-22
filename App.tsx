/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import type {PropsWithChildren} from 'react';
import {
  ActivityIndicator,
  FlatList,
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

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}
type PokemonItemAPI = {name: string; url: string};
type ResponsePage = {
  next: string;
  previous: string;
  offset: number;
  limit: number;
};

function App(): JSX.Element {
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
      <View style={styles.itemContainer}>
        <Text style={styles.header}>{props.name}</Text>
        <Text style={styles.item} numberOfLines={1}>{props.url}</Text>
      </View>
    );
  };
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
        renderItem={({item}) => <PokemonItem name={item.name} url={item.url} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    flex: 1
  },
  header: {
    backgroundColor: '#BBB',
    color: '#000',
    textShadowColor: '#00F',
    textShadowOffset: {width: 5, height: 5},
    textShadowRadius: 10,
    fontWeight: 'bold',
    fontSize: 32,
    flex: 1
  },
  itemContainer: {
    flex: 1,
    borderWidth: 2,
    flexDirection: 'column'
  },
  contentList: {
    flexDirection: 'column'
  }
});

export default App;
