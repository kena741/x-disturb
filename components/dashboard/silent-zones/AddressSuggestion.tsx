"use client";

import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface AddressFieldProps {
  label?: string;
  placeholder?: string;
  onSelect: (address: string) => void;
  value?: string;
}

const AddressField: React.FC<AddressFieldProps> = ({
  placeholder = "Street Address/City/State/ZIP",
  onSelect,
  value = "",
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = async (input: string) => {
    setQuery(input);

    if (input.length > 2) {
      setLoading(true);
      try {
        console.log("Fetching suggestions...");
        const response = await axios.get(
          "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest",
          {
            params: {
              text: input,
              category: "Address",
              f: "json",
              countryCode: "ETH",
            },
          }
        );

        const suggestionsData = response.data.suggestions.map(
          (item: { text: string }) => item.text
        );
        setSuggestions(suggestionsData);
        setOpen(true);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleSelect = (address: string) => {
    setQuery(address);
    setSuggestions([]);
    setOpen(false);
    onSelect(address);
  };

  return (
    <div className="md:w-full space-y-2 relative">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {suggestions.length > 0 && open && (
         <div className="absolute left-0 right-0 z-50 mt-1 ">
        <Command className="rounded-md border border-border bg-popover shadow-md">
          <CommandList>
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => handleSelect(suggestion)}
                  className="cursor-pointer"
                >
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
        </div>
      )}
    </div>
  );
};

export default AddressField;