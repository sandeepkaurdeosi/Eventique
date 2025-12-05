"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { eventFormSchema } from "@/lib/validator";
import * as z from "zod";
import { eventDefaultValues } from "@/constants";
import Dropdown from "./Dropdown";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "./FileUploader";
import { useState } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { useUploadThing } from "@/lib/uploadthing";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/event.actions";
import { IEvent } from "@/lib/mongodb/database/models/event.model";
import { useUser } from "@clerk/nextjs"; // ✅ added

import "react-datepicker/dist/react-datepicker.css";

type EventFormProps = {
  type: "Create" | "Update";
  event?: IEvent;
  eventId?: string;
};

const EventForm = ({ type, event, eventId }: EventFormProps) => {
  const { user } = useUser(); // ✅ client-side user
  const userId = user?.id;

  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  const initialValues =
    event && type === "Update"
      ? {
          ...event,
          startDateTime: new Date(event.startDateTime),
          endDateTime: new Date(event.endDateTime),
        }
      : eventDefaultValues;

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (!userId) return alert("You must be logged in to create or update events");

    let uploadedImageUrl = values.imageUrl;

    if (files.length > 0) {
      const uploadedImages = await startUpload(files);
      if (!uploadedImages) return;
      uploadedImageUrl = uploadedImages[0].url;
    }

    try {
      if (type === "Create") {
        const newEvent = await createEvent({
          event: { ...values, imageUrl: uploadedImageUrl },
          userId,
          path: "/profile",
        });
        if (newEvent) {
          form.reset();
          router.push(`/events/${newEvent._id}`);
        }
      } else {
        if (!eventId) return router.back();
        const updatedEvent = await updateEvent({
          userId,
          event: { ...values, imageUrl: uploadedImageUrl, _id: eventId },
          path: `/events/${eventId}`,
        });
        if (updatedEvent) {
          form.reset();
          router.push(`/events/${updatedEvent._id}`);
        }
      }
    } catch (error) {
      console.log("🔥 ERROR:", error);
    }
    console.log("DEBUG USER ID =", userId);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-5 md:p-8 bg-white shadow-md rounded-2xl"
      >
        {/* Title & Category */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Dropdown onChangeHandler={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description & Image */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Textarea
                    placeholder="Write event description..."
                    {...field}
                    className="min-h-[200px] rounded-2xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <FileUploader
                    onFieldChange={field.onChange}
                    imageUrl={field.value}
                    setFiles={setFiles}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-3 bg-grey-50 rounded-full px-4 py-2">
                  <Image
                    src="/assets/icons/location-grey.svg"
                    alt="location"
                    width={20}
                    height={20}
                  />
                  <Input
                    placeholder="Event location or Online"
                    {...field}
                    className="border-0 bg-transparent focus:ring-0"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start & End Dates */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex items-center gap-3 bg-grey-50 rounded-full px-4 py-2 relative z-30">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={20}
                      height={20}
                    />
                    <p className="text-grey-600 whitespace-nowrap">Start Date:</p>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date ?? new Date())}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="Select start date & time"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex items-center gap-3 bg-grey-50 rounded-full px-4 py-2 relative z-30">
                    <Image
                      src="/assets/icons/calendar.svg"
                      alt="calendar"
                      width={20}
                      height={20}
                    />
                    <p className="text-grey-600 whitespace-nowrap">End Date:</p>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => field.onChange(date ?? new Date())}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="Select end date & time"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price & URL */}
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex items-center justify-between bg-grey-50 rounded-full px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/assets/icons/dollar.svg"
                        alt="dollar"
                        width={18}
                        height={18}
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        {...field}
                        className="border-0 bg-transparent focus:ring-0 w-full"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <label htmlFor="isFree" className="text-sm">
                            Free Ticket
                          </label>
                          <Checkbox
                            id="isFree"
                            onCheckedChange={field.onChange}
                            checked={field.value}
                          />
                        </div>
                      )}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="flex items-center gap-3 bg-grey-50 rounded-full px-4 py-2">
                    <Image
                      src="/assets/icons/link.svg"
                      alt="link"
                      width={20}
                      height={20}
                    />
                    <Input
                      placeholder="Event link / registration URL"
                      {...field}
                      className="border-0 bg-transparent focus:ring-0"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full mt-3"
        >
          {form.formState.isSubmitting ? "Submitting..." : `${type} Event`}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;

