import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory } from 'react-router-dom'
import './styles.css';
import logo from '../../assets/logo.svg';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet'

interface Item{
    title: string;
    image_url: string;
    id: number;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse{
    nome: string;
}

const CreatePoint = () =>{
    const [items, setItems] = useState<Array<Item>>([]);
    const [ufList, setUfList] = useState<Array<string>>([]);
    const [cityList, setCityNames] = useState<Array<string>>([]);

    const [selectedUf, setUf] = useState('0');
    const [selectedCity, setCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setinitialPosition] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelecteditems] = useState<number[]>([]);

    const history = useHistory();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setinitialPosition([latitude, longitude]);
        });
    },[]);

    useEffect(() => {
        api.get('/items')
        .then((response) => {
            console.log(response);
            setItems(response.data);
        })
        .catch((err)=> console.log(err));
    },[]);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then((response) =>{
            const ufInitials = response.data.map((uf) => uf.sigla);
            setUfList(ufInitials);
        })
        .catch((err)=> console.log(err));
    },[]);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then((response) =>{
            const cityNames = response.data.map((city) => city.nome);
            setCityNames(cityNames);
        })
        .catch((err)=> console.log(err));
    },[selectedUf]);


    const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
        setUf(event.target.value);
    }

    const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
        setCity(event.target.value);
    }

    const handleMapClick = (event:LeafletMouseEvent) => {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        setFormData({
            ...formData, [name]: value
        });
    }

    const handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.findIndex((s) => s === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter((item) => item !== id);
            setSelecteditems(filteredItems);
        }else{
            setSelecteditems([...selectedItems, id])
        }
        
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };
        console.log(data);

        await api.post('points', data);

        alert('point created');

        history.push('/');

    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"></img>
                <Link to="/">
                    <FiArrowLeft/>
                    Back to Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>New <br/> collection point</h1>

                <fieldset>
                    <legend>
                        <h2>Data</h2>
                    </legend>
                    
                    
                    <div className="field">
                        <label htmlFor="name">Name of entity</label>
                        <input
                        type="text"
                        name="name"
                        id="name" 
                        onChange={handleInputChange}
                        />                        
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                            type="email"
                            name="email"
                            id="email" 
                            onChange={handleInputChange}
                            />                        
                        </div>

                        <div className="field">
                            <label htmlFor="name">Phone number</label>
                            <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp" 
                            onChange={handleInputChange}
                            />                        
                        </div>

                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Address</h2>
                        <span>Select an address in the map</span>
                    </legend>

                    <Map 
                        center={initialPosition} 
                        zoom={14}
                        onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">State</label>
                            <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                <option value="0">Select a State</option>
                                {
                                    ufList.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">City</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Select a City</option>
                                {
                                    cityList.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Collectable items</h2>
                        <span>Select one item or more</span>
                    </legend>

                    <ul className="items-grid">
                        {
                            items.length > 0 &&
                            items.map((item) => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected': '' }>
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                    </ul>
                </fieldset>     

                <button type="submit">Add collection point</button>                           
            </form>
        </div>
    
    )

}

export default CreatePoint;