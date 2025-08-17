import logo from './logo.svg';
import './App.css';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import {Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import ImageWMS from 'ol/source/ImageWMS';
import {transform} from 'ol/proj';
import React, { useState, useEffect, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import XYZ from 'ol/source/XYZ.js';
import WMSCapabilities from 'ol/format/WMSCapabilities.js';

function App() {
  const [wmsRequests, setWmsRequests] = useState([]);
  const [wfsRequests, setWfsRequests] = useState([]);
  const [wcsRequests, setWcsRequests] = useState([]);
  const [layers, setLayers] = useState([]);
  const [formats, setFormats] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [coverages, setCoverages] = useState([]);
  const [srss, setSrss] = useState([]);
  const [styles, setStyles] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [map, setMap] = useState(null);
  const [wmsUrl, setWmsUrl] = useState('http://localhost:8080/geoserver/ows?service=WMS&version=1.1.1&request=GetCapabilities');
  const [wfsUrl, setWfsUrl] = useState('http://localhost:8080/geoserver/ows?service=WFS&version=1.1.0&request=GetCapabilities');
  const [wcsUrl, setWcsUrl] = useState('http://localhost:8080/geoserver/ows?service=WCS&version=1.1.1&request=GetCapabilities');
  const [selectedWmsRequest, setSelectedWmsRequest] = useState(null);
  const [selectedWfsRequest, setSelectedWfsRequest] = useState(null);
  const [selectedWcsRequest, setSelectedWcsRequest] = useState(null);
  const [selectedLayers, setSelectedLayer] = useState(null);
  const [selectedFeatures, setSelectedFeature] = useState(null);
  const [selectedCoverages, setSelectedCoverage] = useState(null);
  const [selectedSrs, setSelectedSrs] = useState(null);
  const [selectedFormats, setSelectedFormats] = useState(null);
  const [selectedStyles, setSelectedStyles] = useState(null);
  const [heights, setHeights] = useState('');
  const [widths, setWidths] = useState('');
  const [minX, setMinX] = useState('');
  const [maxX, setMaxX] = useState('');
  const [minY, setMinY] = useState('');
  const [maxY, setMaxY] = useState('');
  const [wmsGetCapabilities, setWmsGetCapabilities] = useState('');
  const [wfsGetCapabilities, setWfsGetCapabilities] = useState('');
  const [wcsGetCapabilities, setWcsGetCapabilities] = useState('');
  const [wfsDescribeFeatureType, setWfsDescribeFeatureType] = useState('');
  const [wcsDescribeCoverage, setWcsDescribeCoverage] = useState('');

  var layers_for_WMS=[
    new TileLayer({
        source: new OSM()
    })
  ];

  useEffect(() => {
    if (!map) {
      const mapInstance = new Map({
        target: 'map-v',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2
        })
      });
      setMap(mapInstance);
    }
  }, [map, selectedWmsRequest]);

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleWmsUrlChange = (event) => {
    setWmsUrl(event.target.value);
  }

  const handleWfsUrlChange = (event) => {
    setWmsUrl(event.target.value);
  }

  const handleWcsUrlChange = (event) => {
    setWmsUrl(event.target.value);
  }

  const handleWmsRequestChange = (event) => {
    setSelectedWmsRequest(event.target.value);
    map.removeLayer(map.getAllLayers());
  };

  const handleLayerChange = (event) => {
    setSelectedLayer(event.target.value);
  };

  const handleFeatureChange = (event) => {
    setSelectedFeature(event.target.value);
  }

  const handleSrsChange = (event) => {
    setSelectedSrs(event.target.value);
  };

  const handleStyleChange = (event) => {
    setSelectedStyles(event.target.value);
  };

  const handleWfsRequestChange = (event) => {
    setSelectedWfsRequest(event.target.value);
  }

  const handleMinXChange = (event) => {
    setMinX(event.target.value);
  }

  const handleMaxXChange = (event) => {
    setMaxX(event.target.value);
  }

  const handleMinYChange = (event) => {
    setMinY(event.target.value);
  }

  const handleMaxYChange = (event) => {
    setMaxY(event.target.value);
  }

  const handleWmsFormatChange = (event) => {
    setSelectedFormats(event.target.value);
  }

  const handleSelectedWidthChange = (event) => {
    setWidths(event.target.value);
  }

  const handleSelectedHeightChange = (event) => {
    setHeights(event.target.value);
  }

  const handleCoverageChange = (event) => {
    setSelectedCoverage(event.target.value);
  }

  const handleWcsRequestChange = (event) => {
    setSelectedWcsRequest(event.target.value);
  }

  useEffect(() => {
    // Fetch WMS capabilities from the GeoServer
    fetch(wmsUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const requestElements = xmlDoc.getElementsByTagName('Request')[0].children;
            const requestNames = [];
            const layerElements = xmlDoc.getElementsByTagName('Layer');
            const layerNames = [];
            for (let i = 0; i < requestElements.length; i++) {
                const requestName = requestElements[i];
                requestNames.push(requestName);
            }
            for (let i = 0; i < layerElements.length; i++) {
              const layerName = layerElements[i].getElementsByTagName('Name')[0];
              layerNames.push(layerName);
            }
            setWmsRequests(requestNames);
            setLayers(layerNames);
            setWmsGetCapabilities(data);
        })
        .catch(error => {
            console.error('Error fetching WMS capabilities:', error);
        });
}, [wmsUrl]);

  useEffect(() => {
    fetch(wmsUrl)
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const layerElements = xmlDoc.getElementsByTagName('Layer');

          Array.from(layerElements).forEach(layer => {
            const nameElement = layer.getElementsByTagName('Name')[0];
            if (nameElement && nameElement.textContent === selectedLayers) {
              const srsElement = layer.getElementsByTagName('SRS');
              if (srsElement) {
                setSrss(Array.from(srsElement));
              }
            }
          });
        })
        .catch(error => {
          console.error('Error fetching WMS capabilities:', error);
      });
  }, [wmsUrl, selectedLayers])

  useEffect(() => {
    fetch(wmsUrl)
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const layerElements = xmlDoc.getElementsByTagName('Layer');

          Array.from(layerElements).forEach((layer) => {
            const nameElement = layer.getElementsByTagName('Name')[0];
            if (nameElement && nameElement.textContent === selectedLayers) {
              const styleElements = layer.getElementsByTagName('Style');
              const boundingBoxes = layer.getElementsByTagName('BoundingBox');
              Array.from(boundingBoxes).forEach((bbox) => {
                const srsAttribute = bbox.getAttribute('SRS');
                if (srsAttribute && srsAttribute === selectedSrs) {
                  setMinX(bbox.getAttribute('minx') || '');
                  setMaxX(bbox.getAttribute('maxx') || '');
                  setMinY(bbox.getAttribute('miny') || '');
                  setMaxY(bbox.getAttribute('maxy') || '');
                }
              });
              const extractedNames = Array.from(styleElements).map(style => {
                const nameElement = style.getElementsByTagName('Name')[0];
                return nameElement.textContent;
              });
              setStyles(extractedNames);
            }
          });
        })
        .catch(error => {
          console.error('Error fetching WMS capabilities:', error);
      });
  }, [wmsUrl, selectedSrs, selectedLayers])

  useEffect(() => {
    fetch(wmsUrl)
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const layerElements = xmlDoc.getElementsByTagName('Layer');
          Array.from(layerElements).forEach((layer) => {
            const nameElement = layer.getElementsByTagName('Name')[0];
            if (nameElement && nameElement.textContent === selectedLayers) {
              const styleElements = layer.getElementsByTagName('Style');
              Array.from(styleElements).forEach((style) => {
                const styleElement = style.getElementsByTagName('Name')[0];
                  if (styleElement && styleElement.textContent === selectedStyles) {
                    const legendUrls = style.querySelectorAll('LegendURL');
                    const extractedHeights = [];
                    const extractedWidths = [];
                    const extractedFormats = [];

                    legendUrls.forEach(legendURL => {
                      const width = legendURL.getAttribute('width');
                      const height = legendURL.getAttribute('height');
                      const format = legendURL.querySelector('Format').textContent;

                      extractedHeights.push(height);
                      extractedWidths.push(width);
                      extractedFormats.push(format);
                    });

                    setHeights(extractedHeights);
                    setWidths(extractedWidths);
                    setFormats(extractedFormats);
                  }
              })
            }
          });
        })
        .catch(error => {
          console.error('Error fetching WMS capabilities:', error);
      });
  }, [wmsUrl, selectedSrs, selectedLayers, selectedStyles])

  useEffect(() => {
    // Fetch WFS capabilities from the GeoServer
    fetch(wfsUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const requestElements = xmlDoc.getElementsByTagName('ows:OperationsMetadata')[0].children;
            const requestNames = [];
            const layerElements = xmlDoc.getElementsByTagName('FeatureTypeList');
            var layerNames = [];
            for (let i = 0; i < requestElements.length; i++) {
                const requestName = requestElements[i].getAttribute('name');
                requestNames.push(requestName);
            }
            for (let i = 0; i < layerElements.length; i++) {
              const featureTypes = layerElements[i].getElementsByTagName('FeatureType');
              const extractedTitles = Array.from(featureTypes).map(ft => {
                const titleElement = ft.getElementsByTagName('Name')[0];
                return titleElement;
              });
              layerNames = extractedTitles;
            }
            setWfsRequests(requestNames);
            setFeatures(layerNames);
            setWfsGetCapabilities(data);
        })
        .catch(error => {
            console.error('Error fetching WFS capabilities:', error);
        });
  }, [wfsUrl]);

  useEffect(() => {
    // Fetch WCS capabilities from the GeoServer
    fetch(wcsUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const requestElements = xmlDoc.getElementsByTagName('ows:OperationsMetadata')[0].children;
            const requestNames = [];
            const layerElements = xmlDoc.getElementsByTagName('wcs:Contents');
            var layerNames = [];
            for (let i = 0; i < requestElements.length; i++) {
                const requestName = requestElements[i].getAttribute('name');
                requestNames.push(requestName);
            }
            for (let i = 0; i < layerElements.length; i++) {
              const featureTypes = layerElements[i].getElementsByTagName('wcs:CoverageSummary');
              const extractedTitles = Array.from(featureTypes).map(ft => {
                const titleElement = ft.getElementsByTagName('ows:Title')[0];
                return titleElement;
              });
              layerNames = extractedTitles;
            }
            setWcsRequests(requestNames);
            setCoverages(layerNames);
            setWcsGetCapabilities(data);
        })
        .catch(error => {
            console.error('Error fetching WCS capabilities:', error);
        });
  }, [wcsUrl]);

  useEffect(() => {
    fetch('http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=DescribeFeatureType&typeNames='+selectedFeatures)
        .then(response => response.text())
        .then(data => {
            setWfsDescribeFeatureType(data);
        })
        .catch(error => {
            console.error('Error fetching WFS Describe Feature Type:', error);
        });
  }, [selectedFeatures, selectedWfsRequest]);

  useEffect(() => {
    fetch('http://localhost:8080/geoserver/wcs?service=wcs&version=1.1.1&request=DescribeCoverage&identifiers='+selectedCoverages)
        .then(response => response.text())
        .then(data => {
            setWcsDescribeCoverage(data);
        })
        .catch(error => {
            console.error('Error fetching WCS DescribeCoverage:', error);
        });
  }, [selectedCoverages]);

  function getFeatureInfoRequest(){
    var cenX=(minX+maxX)/2;
      var cenY=(minY+maxY)/2;
      var minEdge=transform([minX,minY], selectedSrs, 'EPSG:3857');
      var maxEdge=transform([maxX,maxY], selectedSrs, 'EPSG:3857');
      const wmsSource = new ImageWMS({
        url: 'http://localhost:8080/geoserver/wms',
        params: {'LAYERS': selectedLayers},
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
      });
      
      const wmsLayer = new ImageLayer({
        extent: [minEdge[0], minEdge[1], maxEdge[0], maxEdge[1]],
        source: wmsSource,
      });
      
      const view = new View({
        center: transform([cenX,cenY], selectedSrs, 'EPSG:3857'),
        zoom: 3,
      });
      
      // document.getElementById("map-v").innerHTML="";
      // const map = new Map({
      //   layers: [wmsLayer],
      //   target: 'map-v',
      //   view: view,
      // });

      map.addLayer(wmsLayer);
      map.setView(view);

      var extent = wmsLayer.getExtent();
      map.getView().fit(extent, map.getSize());
      
      map.on('singleclick', function (evt) {
        document.getElementById('info').innerHTML = '';
        const viewResolution = (view.getResolution());
        const url = wmsSource.getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:3857',
          {'INFO_FORMAT': 'text/html'},
        );
        if (url) {
          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              document.getElementById('info').innerHTML = html;
            });
        }
      });
      
      map.on('pointermove', function (evt) {
        if (evt.dragging) {
          return;
        }
        const data = wmsLayer.getData(evt.pixel);
        const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });
  }

  function getMapRequest(){
    // var cenX=(minX+maxX)/2;
    // var cenY=(minY+maxY)/2;
    var minEdge=transform([minX,minY], selectedSrs, 'EPSG:3857');
    var maxEdge=transform([maxX,maxY], selectedSrs, 'EPSG:3857');
    console.log("minX transformed:"+minEdge[0]);
    console.log("minY transformed:"+minEdge[1]);
    // document.getElementById("map-v").innerHTML="";
    var anImageLayer=new ImageLayer({
        extent: [minEdge[0], minEdge[1], maxEdge[0], maxEdge[1]],
        source: new ImageWMS({
          url: 'http://localhost:8080/geoserver/wms',
          params: {'LAYERS': selectedLayers, 'STYLES': selectedStyles},
          ratio: 1,
          serverType: 'geoserver'
        })
      });
    layers_for_WMS.push(anImageLayer);
    // var map = new Map({
    //   layers: layers_for_WMS,
    //   target: 'map-v',
    //   view: new View({
    //     center: transform([cenX,cenY], selectedSrs, 'EPSG:3857'),
    //     zoom: 4
    //   })
    // });
    map.addLayer(anImageLayer);
    var extent = anImageLayer.getExtent();
    map.getView().fit(extent, map.getSize());
  }

  function wmsSubmit(){  // for getFeatureInfo
    if(selectedWmsRequest === 'GetCapabilities'){
      document.getElementById("wms_textarea_label").innerHTML="XML response for GetCapabilities:";
      const parser = new WMSCapabilities();
      const result = parser.read(wmsGetCapabilities);
      // document.getElementById('log').innerText = JSON.stringify(result, null, 2);
      document.getElementById("wms_textarea").value=JSON.stringify(result, null, 2);
    }
    else if(selectedWmsRequest==='GetFeatureInfo'){
      if(selectedLayers){
        getFeatureInfoRequest();
      }
      else{
        alert('select layers');
      }
    }
    else if(selectedWmsRequest==='GetMap'){
      if(selectedLayers){
        if(selectedStyles!=='raster')
          getMapRequest();
        var request="http://localhost:8080/geoserver/wms?request=GetMap&service=WMS&version=1.1.1&layers="+selectedLayers.replace(":", "%3A")+"&styles="+selectedStyles+"&srs="+selectedSrs+"&bbox="+minX+","+minY+","+maxX+","+maxY+"&width="+widths+"&height="+heights+"&format="+selectedFormats.replace("/", "%2F");
        console.log(request);
        var newWindow = window.open(request, '_blank');
      }
      else{
        alert('select layers');
      }
    }
    else{
      alert('Request to be implemented')
    }
  }

  function wfsGetFeatureRequest(){
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return (
          'http://localhost:8080/geoserver/ne/wfs?service=WFS&' +
          'version=1.1.0&request=GetFeature&typename='+selectedFeatures+'&' +
          'outputFormat=application/json'
        );
      },
      strategy: bboxStrategy,
    });
  
    const vector = new VectorLayer({
      source: vectorSource,
      style: {
        'stroke-width': 0.75,
        'stroke-color': 'white',
        'fill-color': 'rgba(100,100,100,0.25)',
      },
    });
    
    const key = '34MIdf71bp7pn3tqeLaR';
    const attributions =
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
    
    document.getElementById("map-v").innerHTML="";
    const raster = new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + key,
        maxZoom: 20,
      }),
    });
    
    const map = new Map({
      layers: [raster, vector],
      target: document.getElementById('map-v'),
      view: new View({
        center: [20, 75],
        maxZoom: 19,
        zoom: 5,
      }),
    });

  }

  function wfsSubmit(){
    if(selectedWfsRequest==='GetCapabilities'){
      document.getElementById("wfs_textarea_label").innerHTML="XML response for GetCapabilities:";
      document.getElementById("wfs_textarea").value=wfsGetCapabilities;
    }
    else if(selectedWfsRequest==='GetFeature'){
      if(selectedFeatures){
        wfsGetFeatureRequest();
      }
      else{
        alert('select features');
      }
    }
    else if(selectedWfsRequest==='DescribeFeatureType'){
      if(selectedFeatures){
        document.getElementById("wfs_textarea_label").innerHTML="Response for DescribeFeatureType:";
        document.getElementById("wfs_textarea").value=wfsDescribeFeatureType;
      }
      else{
        alert('select features');
      }
    }
    else{
      alert('Request to be implemented')
    }
  }

  function getCoverageRequest(){
    var request="http://localhost:8080/geoserver/wcs?SERVICE=WCS&REQUEST=GetCoverage&VERSION=2.0.1&CoverageId="+selectedCoverages+"&compression=LZW&tiling=true&tileheight=256&tilewidth=256";
    var win = window.open(request, '_blank');
    win.focus();
  }

  function wcsSubmit(){
    if(selectedWcsRequest==='GetCapabilities'){
      document.getElementById("wcs_textarea_label").innerHTML="XML response for GetCapabilities:";
      document.getElementById("wcs_textarea").value=wcsGetCapabilities;
    }
    else if(selectedWcsRequest==='GetCoverage'){
      getCoverageRequest();
    }
    else if(selectedWcsRequest==='DescribeCoverage'){
      if(selectedCoverages){
        document.getElementById("wcs_textarea_label").innerHTML="Response for DescribeCoverage:";
        document.getElementById("wcs_textarea").value=wcsDescribeCoverage;
      }
      else{
        alert('select features');
      }
    }
    else{
      alert('Request to be implemented')
    }
  }
  
  return (
    <div className="App">
      <div className="title-container">
        <h1 className="title">WebGIS for Urban Planning</h1>
      </div>
      <div id="left-half" style={{width:"45%",margin:"0.5%",padding:"0.5%",float:"left"}}>
        <div className="tabs">
          <div
            className={`tab ${activeTab === 1 && 'active'}`}
            onClick={() => handleTabClick(1)}
          >
            WMS
          </div>
          <div
            className={`tab ${activeTab === 2 && 'active'}`}
            onClick={() => handleTabClick(2)}
          >
            WFS
          </div>
          <div
            className={`tab ${activeTab === 3 && 'active'}`}
            onClick={() => handleTabClick(3)}
          >
            WCS
          </div>
        </div>
        <div className="tab-content">
          {activeTab === 1 && (
          <div id="wms">
            <h3 >Web Map Service</h3>
            <div id="wms_form" align="left" style={{width:"45%",margin: "0.5%",padding: "0.5%", marginLeft:"5%"}}>
              <form className="mb-3 row">
                <div className="mb-3">
                  <label className="form-label" htmlFor="url_wms">URL</label>
                  <input id="url_wms" onChange={handleWmsUrlChange} value={wmsUrl} className="form-control" type="text"></input>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="request_wms">Request</label>
                  <select id="request_wms" onChange={handleWmsRequestChange} className="form-select">
                    <option value="0">None</option>
                    {wmsRequests.map(req => (
                        <option key={req.tagName} value={req.tagName}>{req.tagName}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="layer_wms">Layers</label>
                  <select id="layer_wms" onChange={handleLayerChange} className="form-select">
                    <option value="0">None</option>
                    {layers.map(layer => (
                        <option key={layer.textContent} value={layer.textContent}>{layer.textContent}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="crs_wms">CRS</label>
                  <select id="crs_wms" onChange={handleSrsChange} className="form-select">
                    <option value="0">None</option>
                    {srss.map(srs => (
                        <option key={srs.textContent} value={srs.textContent}>{srs.textContent}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="minX" id="minX_label" className="form-label">Min X</label>
                  <input type="text" onChange={handleMinXChange} value={minX} className="form-control" id="minX"/>
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxX" id="maxX_label" className="form-label">Max X</label>
                  <input type="text" onChange={handleMaxXChange} value={maxX} className="form-control" id="maxX"/>
                </div>
                <div className="col-md-6">
                  <label htmlFor="minY" id="minY_label" className="form-label">Min Y</label>
                  <input type="text" onChange={handleMinYChange} value={minY} className="form-control" id="minY"/>
                </div>
                <div className="col-md-6">
                  <label htmlFor="maxY" id="maxY_label" className="form-label">Max Y</label>
                  <input type="text" onChange={handleMaxYChange} value={maxY} className="form-control" id="maxY"/>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="style_wms">Styles</label>
                  <select id="style_wms" onChange={handleStyleChange} className="form-select">
                    <option value="0">None</option>
                    {styles.map(style => (
                        <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="wms_format" id="wms_format_label" className="form-label">Formats</label>
                  <select id="wms_format" onChange={handleWmsFormatChange} className="form-select">
                    <option value="0">None</option>
                    {formats.map(format => (
                        <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="wms_size_width" id="wms_size_label" className="form-label">Width</label>
                  <input id="wms_size_width" type="text" className="form-control" value={widths} onChange={handleSelectedWidthChange}></input>
                </div>
                <div className="col-md-6">
                  <label htmlFor="wms_size_height" id="wms_size_label" className="form-label">Height</label>
                  <input id="wms_size_height" type="text" className="form-control" value={heights} onChange={handleSelectedHeightChange}></input>
                </div>
              </form>
              <button id="wms_request_button" type="button" className="btn btn-primary" onClick={wmsSubmit} >
                Send WMS Request
              </button>
            </div>
            <br/>
            <div id="wms_xmlspace" align="left" style={{margin: "0.5%",padding: "0.5%", marginLeft:"5%"}}>
              <form>
                <div className="mb-3">
                  <label className="form-label" id="wms_textarea_label" htmlFor="response_wms" >
                    XML response:
                  </label>
                  <textarea id="wms_textarea" rows={10} cols={150} defaultValue={""}/>
                </div>
              </form>
            </div>
          </div>
          )}
          {activeTab === 2 && (
          <div id="wfs">
            <h3>Web Feature Service</h3>
            <div id="wfs_form" align="left" style={{ width: "45%", margin: "0.5%", padding: "0.5%", marginLeft: "5%" }}>
              <form className="mb-3 row">
                <div className="mb-3">
                  <label className="form-label" htmlFor="url_wfs">URL</label>
                  <input id="url_wfs" onChange={handleWfsUrlChange} value={wfsUrl} className="form-control" type="text"></input>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="request_wfs">Request</label>
                  <select id="request_wfs" onChange={handleWfsRequestChange} className="form-select">
                    <option value="0">None</option>
                    {wfsRequests.map(req => (
                        <option key={req} value={req}>{req}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="featureType_wfs">Feature type</label>
                  <select id="featureType_wfs" onChange={handleFeatureChange} className="form-select">
                    <option value="0">None</option>
                    {features.map(layer => (
                        <option key={layer.textContent} value={layer.textContent}>{layer.textContent}</option>
                    ))}
                  </select>
                </div>
              </form>
              <button id="wfs_request_button" type="button" className="btn btn-primary" onClick={wfsSubmit} >
                  Send WFS Request
              </button>
            </div>
            <br/>
            <div id="wfs_xmlspace" align="left" style={{padding:"0.5%", marginLeft:"5.5%"}}>
              <form>
                <div className="mb-3">
                  <label className="form-label" id="wfs_textarea_label" htmlFor="response_wfs" >
                    XML response:
                  </label>
                  <textarea id="wfs_textarea" rows={10} cols={150} defaultValue={""}/>
                </div>
              </form>
            </div>
          </div>
          )}
          {activeTab === 3 && (
          <div id="wcs">
            <h3>Web Coverage Service</h3>
            <div id="wcs_form" align="left" style={{ width: "45%", margin: "0.5%", padding: "0.5%", marginLeft: "5%" }}>
              <form className="mb-3 row">
                <div className="mb-3">
                  <label className="form-label" htmlFor="url_wcs">URL</label>
                  <input id="url_wcs" onChange={handleWcsUrlChange} value={wcsUrl} className="form-control" type="text"></input>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="request_wcs">Request</label>
                  <select id="request_wcs" onChange={handleWcsRequestChange} className="form-select">
                    <option value="0">None</option>
                    {wcsRequests.map(req => (
                        <option key={req} value={req}>{req}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="coverageType_wcs">Coverage type</label>
                  <select id="coverageType_wcs" onChange={handleCoverageChange} className="form-select">
                    <option value="0">None</option>
                    {coverages.map(layer => (
                        <option key={layer.textContent} value={layer.textContent}>{layer.textContent}</option>
                    ))}
                  </select>
                </div>
              </form>
              <button id="wcs_request_button" type="button" className="btn btn-primary" onClick={wcsSubmit} >
                  Send WCS Request
              </button>
            </div>
            <br/>
            <div id="wcs_xmlspace" align="left" style={{padding:"0.5%", marginLeft:"5.5%"}}>
              <form>
                <div className="mb-3">
                  <label className="form-label" id="wcs_textarea_label" htmlFor="response_wcs" >
                    XML response:
                  </label>
                  <textarea id="wcs_textarea" rows={10} cols={150} defaultValue={""}/>
                </div>
              </form>
            </div>
          </div>
          )}
        </div>
      </div>
      <div className='right-half' style={{margin: "0.5%",padding: "0.5%",float: "right"}}>
        <div id='map-v' style={{width: "650px", height: "450px"}}></div>
        <div id="info">&nbsp;</div>
      </div>
    </div>
  );
}

export default App;