"use client";

import { useEffect, useState, type ReactNode } from "react";

import FormControl from "@/components/shared/form-control";
import type { ActionState } from "@/components/shared/form/utils/to-action-state";
import { SelectField } from "@/components/shared/select-field/select-field";
import { TextareaControl } from "@/components/shared/textarea-control/textarea-control";
import {
  DEFAULT_COUNTRY,
  EGYPT_GOVERNORATE_NAMES,
  getCitiesForGovernorate,
} from "@/lib/constants/egypt-locations";

export type AddressFieldValues = {
  alias?: string;
  governorate?: string;
  city?: string;
  area?: string;
  phone?: string;
  addressLine1?: string;
  details?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
};

export type AddressFormFieldsProps = {
  mode: "registered" | "guest";
  layout?: "stack" | "grid";
  namePrefix?: string;
  defaultValues?: AddressFieldValues;
  actionState?: ActionState;
  destinationFeedback?: ReactNode;
  onDestinationChange?: (destination: {
    country: string;
    governorate: string;
    city: string;
  }) => void;
};

export function AddressFormFields({
  mode,
  layout = "stack",
  namePrefix,
  defaultValues,
  actionState,
  destinationFeedback,
  onDestinationChange,
}: AddressFormFieldsProps) {
  const name = (field: string) =>
    namePrefix ? `${namePrefix}.${field}` : field;

  const payloadString = (field: string) => {
    const value = actionState?.payload?.[name(field)];
    return typeof value === "string" ? value : undefined;
  };

  const [governorate, setGovernorate] = useState(
    payloadString("governorate") ?? defaultValues?.governorate ?? "",
  );

  // Only fall back to the address's original city when the governorate
  // hasn't changed from its original value — otherwise a stale city from a
  // *different* governorate (e.g. a Giza city left over after switching to
  // Cairo) would get appended into the new governorate's options and
  // pre-selected, silently producing a geographically inconsistent address.
  const cityDefault =
    payloadString("city") ??
    (governorate === (defaultValues?.governorate ?? "")
      ? (defaultValues?.city ?? "")
      : "");
  const [city, setCity] = useState(cityDefault);

  useEffect(() => {
    onDestinationChange?.({ country: DEFAULT_COUNTRY, governorate, city });
  }, [governorate, city, onDestinationChange]);

  const seededCityOptions = getCitiesForGovernorate(governorate);
  const cityOptions =
    cityDefault && !seededCityOptions.includes(cityDefault)
      ? [...seededCityOptions, cityDefault]
      : seededCityOptions;

  const governorateOptions =
    governorate && !EGYPT_GOVERNORATE_NAMES.includes(governorate)
      ? [...EGYPT_GOVERNORATE_NAMES, governorate]
      : EGYPT_GOVERNORATE_NAMES;

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-3 gap-3">
        <FormControl
          name={name("country")}
          label="Country"
          type="text"
          value={DEFAULT_COUNTRY}
          readOnly
          actionState={actionState}
        />

        <SelectField
          name={name("governorate")}
          label="Governorate"
          options={governorateOptions}
          placeholder="Select governorate"
          defaultValue={governorate}
          actionState={actionState}
          onValueChange={(next) => {
            setGovernorate(next);
            setCity(
              getCitiesForGovernorate(next).includes(cityDefault)
                ? cityDefault
                : "",
            );
          }}
        />

        <SelectField
          key={governorate}
          name={name("city")}
          label="City"
          options={cityOptions}
          placeholder={
            governorate ? "Select city" : "Select a governorate first"
          }
          defaultValue={cityDefault}
          disabled={!governorate || cityOptions.length === 0}
          actionState={actionState}
          onValueChange={(next) => {
            setCity(next);
          }}
        />

        {destinationFeedback ? (
          <div className="col-span-full">{destinationFeedback}</div>
        ) : null}

        <FormControl
          name={name("area")}
          label="Area"
          type="text"
          maxLength={120}
          defaultValue={payloadString("area") ?? defaultValues?.area ?? ""}
          actionState={actionState}
        />

        <FormControl
          name={name("phone")}
          label="Phone at this address"
          type="tel"
          placeholder="+201000000002"
          defaultValue={payloadString("phone") ?? defaultValues?.phone ?? ""}
          actionState={actionState}
        />

        <FormControl
          name={name("postalCode")}
          label="Postal code (optional)"
          type="number"
          min={1}
          max={999999}
          defaultValue={
            payloadString("postalCode") ?? defaultValues?.postalCode ?? ""
          }
          actionState={actionState}
        />

        <div className="col-span-full">
          <FormControl
            name={name("addressLine1")}
            label="Street address"
            type="text"
            maxLength={500}
            defaultValue={
              payloadString("addressLine1") ?? defaultValues?.addressLine1 ?? ""
            }
            actionState={actionState}
          />
        </div>

        <div className="col-span-full">
          <TextareaControl
            name={name("details")}
            label="Details for the courier"
            maxLength={1000}
            defaultValue={
              payloadString("details") ?? defaultValues?.details ?? ""
            }
            actionState={actionState}
            className="min-h-[60px]"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <input type="hidden" name={name("country")} value={DEFAULT_COUNTRY} />

      {mode === "registered" ? (
        <FormControl
          name={name("alias")}
          label="Alias"
          type="text"
          maxLength={120}
          defaultValue={
            payloadString("alias") ?? defaultValues?.alias ?? ""
          }
          actionState={actionState}
        />
      ) : null}

      <SelectField
        name={name("governorate")}
        label="Governorate"
        options={governorateOptions}
        placeholder="Select governorate"
        defaultValue={governorate}
        actionState={actionState}
        onValueChange={(next) => {
          setGovernorate(next);
          setCity(
            getCitiesForGovernorate(next).includes(cityDefault)
              ? cityDefault
              : "",
          );
        }}
      />

      <SelectField
        key={governorate}
        name={name("city")}
        label="City"
        options={cityOptions}
        placeholder={
          governorate ? "Select city" : "Select a governorate first"
        }
        defaultValue={cityDefault}
        disabled={!governorate || cityOptions.length === 0}
        actionState={actionState}
        onValueChange={(next) => {
          setCity(next);
        }}
      />

      <FormControl
        name={name("area")}
        label="Area"
        type="text"
        maxLength={120}
        defaultValue={payloadString("area") ?? defaultValues?.area ?? ""}
        actionState={actionState}
      />

      <FormControl
        name={name("addressLine1")}
        label="Address line"
        type="text"
        maxLength={500}
        defaultValue={
          payloadString("addressLine1") ?? defaultValues?.addressLine1 ?? ""
        }
        actionState={actionState}
      />

      <TextareaControl
        name={name("details")}
        label="Details"
        maxLength={1000}
        defaultValue={
          payloadString("details") ?? defaultValues?.details ?? ""
        }
        actionState={actionState}
      />

      <FormControl
        name={name("phone")}
        label="Phone"
        type="tel"
        placeholder="+201000000002"
        defaultValue={payloadString("phone") ?? defaultValues?.phone ?? ""}
        actionState={actionState}
      />

      <FormControl
        name={name("postalCode")}
        label="Postal code (optional)"
        type="number"
        min={1}
        max={999999}
        defaultValue={
          payloadString("postalCode") ?? defaultValues?.postalCode ?? ""
        }
        actionState={actionState}
      />

      <FormControl
        name={name("latitude")}
        label="Latitude (optional)"
        type="number"
        step="any"
        min={-90}
        max={90}
        defaultValue={
          payloadString("latitude") ?? defaultValues?.latitude ?? ""
        }
        actionState={actionState}
      />

      <FormControl
        name={name("longitude")}
        label="Longitude (optional)"
        type="number"
        step="any"
        min={-180}
        max={180}
        defaultValue={
          payloadString("longitude") ?? defaultValues?.longitude ?? ""
        }
        actionState={actionState}
      />
    </>
  );
}
