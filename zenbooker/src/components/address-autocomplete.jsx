"use client"

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

const API_BASE_URL = 'https://zenbookapi.now2code.online/api';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onAddressSelect, 
  placeholder = "Enter address...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/places/autocomplete?input=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the API call
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionSelect = async (suggestion) => {
    try {
      // Get detailed place information
      const response = await fetch(
        `${API_BASE_URL}/places/details?place_id=${suggestion.place_id}`
      );
      const data = await response.json();
      
      if (data.result) {
        const place = data.result;
        let addressComponents = {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States'
        };
        
        // Extract address components
        place.address_components.forEach(component => {
          if (component.types.includes('street_number') || component.types.includes('route')) {
            addressComponents.street += component.long_name + ' ';
          } else if (component.types.includes('locality')) {
            addressComponents.city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            addressComponents.state = component.short_name;
          } else if (component.types.includes('postal_code')) {
            addressComponents.zipCode = component.long_name;
          } else if (component.types.includes('country')) {
            addressComponents.country = component.long_name;
          }
        });
        
        // Clean up street address
        addressComponents.street = addressComponents.street.trim();
        
        console.log('Address components extracted:', addressComponents);
        setInputValue(suggestion.description);
        onChange?.(suggestion.description);
        console.log('Calling onAddressSelect with:', addressComponents);
        onAddressSelect?.(addressComponents);
      } else {
        // Fallback if detailed info not available
        setInputValue(suggestion.description);
        onChange?.(suggestion.description);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      // Fallback to just the description
      setInputValue(suggestion.description);
      onChange?.(suggestion.description);
    }
    
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-900">{suggestion.description}</div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <div className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
