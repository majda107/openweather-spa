Vue.component('city-display', {
    props: [
        'data'
    ],
    template: '<div class="display"><h2>{{ data.name }}</h2><div class="data"><h3>Temperature: <span>{{ data.main.temp }}C</span> </h3><h3> Pressure: <span>{{ data.main.pressure }} mb</span></h3><h3> Humidity: <span>{{ data.main.humidity }}%</span> </h3><h3>Feels like: <span>{{ data.main.feels_like}}C</span></h3><h3>Weather: <span>{{ data.weather[0].main }}</span></h3><h3>Wind speed: <span>{{ data.wind.speed }} m/s</span></h3></div><weather-icon v-bind:icon="data.weather[0].icon"></weather-icon><city-map v-bind:coord="data.coord"></city-map></div>'
})

Vue.component('weather-icon', {
    props: [
        'icon'
    ],
    template: '<div class="icon-container"><img v-bind:src="\'http://openweathermap.org/img/wn/\' + icon + \'@2x.png\'"/></div>'
})

Vue.component('favorites', {
    props: [
        'favs',
    ],
    methods: {
        clicked: function(city) {
            this.$emit('selected', city)
            console.log("emitting selected city")
        },
    },
    template: '<div class="favorites"><ul><li v-for="fav in favs"><button @click="clicked(fav)">{{ fav }}</button></li></ul></div>'
})

Vue.component('city-map', {
    props: [
        'coord'
    ],
    template: '<div class="map"><iframe v-bind:src="\'https://maps.google.com/maps?q=\' + coord.lat + \',\' + coord.lon + \'&hl=es;z=14&amp;output=embed\'"></iframe></div>'
})

var app = new Vue({
    el: '#app',
    data: {
        city: null,
        name: "",
        zip: "",
        favs: []
    },
    methods: {
        getCity: function(city, cityAction = null) {
            console.log("getting city")

            let url = city.length != 2 ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=3ee141760b3dd7366f6ecbdb75ac5b72&units=metric` : `https://api.openweathermap.org/data/2.5/weather?zip=${this.zip},${city}&APPID=3ee141760b3dd7366f6ecbdb75ac5b72&units=metric`
            axios.get(url).then(response => {
                this.city = response.data
                console.log(this.city)

                if(cityAction != null) {
                    cityAction(this.city.name)
                }
            }).catch(error => {
                this.city = null
                console.log(error)
                alert("Invalid city name!")
            })
        },

        addFavorite: function(city) {
            if(this.favs.includes(city)) return
            this.favs.push(city)
            console.log("adding " + city + " to favorites")

            this.save()
        },

        removeFavorite: function(city) {
            if(this.favs.includes(city)) {
                this.favs.splice(this.favs.indexOf(city), 1)
                this.save()
            }
        },

        save: function() {
            localStorage.setItem('favorites', JSON.stringify(this.favs))
        },

        load: function() {
            temp = localStorage.getItem("favorites")
            console.log(temp)
            if(temp != undefined) {
                console.log('Favs...', temp)
                this.favs = JSON.parse(temp)
            }
        }
    },
    created: function() {
        this.load()
        // this.getCity(this.name)
    },
    template: '<div class="app"><h2>Search...</h2><input v-model="name" placeholder="city / country code"/><input v-model="zip" placeholder="ZIP"/><button @click="getCity(name)">Get city data!</button><favorites v-bind:favs="favs" v-on:selected="getCity"></favorites><button @click="getCity(name, addFavorite)">Add to favorites!</button><button @click="getCity(city.name, removeFavorite)">Remove from favorites...</button><div v-if="city != null"><city-display v-bind:data="city"></city-display></div><div v-else><h2>No cities found...</h2></div></div>'
})