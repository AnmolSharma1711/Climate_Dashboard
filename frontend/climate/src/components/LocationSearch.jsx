import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './LocationSearch.css';

const LocationSearch = ({ onLocationSelect, currentLocation, onLocationCoordinates }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showQuickCities, setShowQuickCities] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Popular cities for quick access and fallback search
  const quickCities = [
    { name: 'London', country: 'UK', region: 'England' },
    { name: 'New York', country: 'USA', region: 'New York' },
    { name: 'Tokyo', country: 'Japan', region: 'Tokyo' },
    { name: 'Delhi', country: 'India', region: 'National Capital Territory' },
    { name: 'Mumbai', country: 'India', region: 'Maharashtra' },
    { name: 'Paris', country: 'France', region: 'Île-de-France' },
    { name: 'Sydney', country: 'Australia', region: 'New South Wales' },
    { name: 'Dubai', country: 'UAE', region: 'Dubai' },
    { name: 'Los Angeles', country: 'USA', region: 'California' },
    { name: 'Beijing', country: 'China', region: 'Beijing' },
    { name: 'Singapore', country: 'Singapore', region: 'Singapore' },
    { name: 'Hong Kong', country: 'Hong Kong', region: 'Hong Kong' },
    { name: 'Toronto', country: 'Canada', region: 'Ontario' },
    { name: 'Berlin', country: 'Germany', region: 'Berlin' },
    { name: 'Madrid', country: 'Spain', region: 'Madrid' },
    { name: 'Rome', country: 'Italy', region: 'Lazio' },
    { name: 'Moscow', country: 'Russia', region: 'Moscow' },
    { name: 'Bangkok', country: 'Thailand', region: 'Bangkok' },
    { name: 'Seoul', country: 'South Korea', region: 'Seoul' },
    { name: 'Cairo', country: 'Egypt', region: 'Cairo' }
  ];

  // Fallback search function for offline/API failure scenarios
  const fallbackSearch = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return quickCities.filter(city => 
      city.name.toLowerCase().includes(lowercaseQuery) ||
      city.country.toLowerCase().includes(lowercaseQuery) ||
      city.region.toLowerCase().includes(lowercaseQuery)
    ).map(city => ({
      name: city.name,
      country: city.country,
      region: city.region,
      display_name: `${city.name}, ${city.region}, ${city.country}`
    }));
  };

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchLocations(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false); // Reset searching state
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      // Also reset searching state if component unmounts or query changes
      if (searchQuery.length < 2) {
        setIsSearching(false);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setShowQuickCities(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/search-locations?q=${encodeURIComponent(query)}`, {
        timeout: 5000 // 5 second timeout
      });
      setSuggestions(response.data || []);
      setShowSuggestions((response.data || []).length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      
      // Use fallback search if API fails
      console.log('Using fallback search for:', query);
      const fallbackResults = fallbackSearch(query);
      setSuggestions(fallbackResults);
      setShowSuggestions(fallbackResults.length > 0);
      
      // Show user-friendly error message
      if (error.code === 'ECONNABORTED') {
        console.warn('Search request timed out - using offline search');
      } else if (error.response?.status === 404) {
        console.warn('Search endpoint not found - using offline search');
      } else {
        console.warn('Search API unavailable - using offline search');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Clear current location indicator when user starts typing
    if (userLocation) {
      setUserLocation(null);
    }
  };

  const handleLocationSelect = (location) => {
    setSearchQuery(location.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    // Clear current location indicator when manually selecting a location
    setUserLocation(null);
    onLocationSelect(location.name);
    
    // Pass coordinates to parent for map navigation
    if (onLocationCoordinates && location.lat && location.lon) {
      onLocationCoordinates([location.lat, location.lon]);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get location name
          const coords = `${latitude},${longitude}`;
          const response = await axios.get(`http://127.0.0.1:5000/api/current?city=${coords}`);
          
          if (response.data && response.data.city) {
            const locationName = response.data.city;
            setSearchQuery(`${locationName}, ${response.data.country}`);
            setUserLocation({ lat: latitude, lon: longitude, name: locationName });
            onLocationSelect(locationName);
            
            // Pass coordinates to parent for map navigation
            if (onLocationCoordinates) {
              onLocationCoordinates([latitude, longitude]);
            }
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          alert('Could not get location details. Please try searching manually.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Unknown error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        alert(`Error getting location: ${errorMessage}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleLocationSelect(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleQuickCitySelect = (city) => {
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowQuickCities(false);
    // Clear current location indicator when selecting a quick city
    setUserLocation(null);
    onLocationSelect(city.name);
    
    // For quick cities, we need to get coordinates from the API response
    // This will be handled by the parent component's fetchDataForCity function
  };

  return (
    <div className="location-search position-relative">
      <div className="input-group">
        <span className="input-group-text bg-light">
          <i className="fas fa-search"></i>
        </span>
        <input
          ref={searchRef}
          type="text"
          className="form-control"
          placeholder="Search for a city or location..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          style={{ minWidth: '300px' }}
        />
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          title="Use current location"
        >
          {gettingLocation ? (
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i className="fas fa-location-arrow"></i>
          )}
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setShowQuickCities(!showQuickCities)}
          title="Popular cities"
        >
          <i className="fas fa-city"></i>
        </button>
        {isSearching && (
          <span className="input-group-text">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Searching...</span>
            </div>
          </span>
        )}
      </div>

      {/* Quick Cities dropdown */}
      {showQuickCities && (
        <div
          className="position-absolute w-100 bg-white border border-top-0 shadow-lg"
          style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}
        >
          <div className="p-2 bg-light border-bottom">
            <small className="text-muted fw-semibold">Popular Cities</small>
          </div>
          <div className="row g-1 p-2">
            {quickCities.map((city, index) => (
              <div key={index} className="col-6">
                <button
                  className="btn btn-outline-primary btn-sm w-100 text-start"
                  onClick={() => handleQuickCitySelect(city)}
                >
                  <i className="fas fa-map-marker-alt me-1"></i>
                  <small>{city.name}</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="position-absolute w-100 bg-white border border-top-0 shadow-lg"
          style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}
        >
          <div className="p-2 bg-light border-bottom">
            <small className="text-muted fw-semibold">Search Results</small>
          </div>
          {suggestions.map((location, index) => (
            <div
              key={index}
              className="p-3 border-bottom suggestion-item"
              onClick={() => handleLocationSelect(location)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div className="fw-semibold">
                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                {location.name}
              </div>
              <small className="text-muted">
                {location.region && `${location.region}, `}{location.country}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* Current location indicator */}
      {userLocation && searchQuery.includes(userLocation.name) && (
        <small className="text-success mt-1 d-block">
          <i className="fas fa-check-circle me-1"></i>
          Using your current location
        </small>
      )}
    </div>
  );
};

export default LocationSearch;
