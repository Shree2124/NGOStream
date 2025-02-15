import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/Form";
import { Textarea } from "../../components/ui/TextArea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/RadioGroup";
import { Slider } from "../../components/ui/Slider";
import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import { SkipPrevious } from "@mui/icons-material";
import toast from "react-hot-toast";

interface EventDetails {
  id: string;
  name: string;
  startDate: string;
  location: string;
}

// Feedback Form Interface
interface FeedbackFormData {
  overallSatisfaction: number;
  suggestions?: string;
  wouldRecommend: "Definitely" | "Maybe" | "No";
}

const FeedbackForm: React.FC = () => {
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { eventId } = useParams();

  const navigate = useNavigate();

  // Initialize the form
  const form = useForm<FeedbackFormData>({
    defaultValues: {
      overallSatisfaction: 3,
      suggestions: "",
      wouldRecommend: "Maybe",
    },
    mode: "onBlur",
  });

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        // Extract event ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams);
        // const eventId = urlParams.get('eventId');

        console.log(eventId);

        if (!eventId) {
          throw new Error("No event ID provided");
        }

        // Simulated API call - replace with your actual backend endpoint
        const response = await api.get(`/event/${eventId}`);
        console.log(response);

        // if (!response.ok) {
        //   throw new Error("Failed to fetch event details");
        // }

        const data: EventDetails = await response.data.data;
        setEventDetails(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, []);

  // Handle form submission
  const onSubmit = async (data: FeedbackFormData) => {
    if (!eventDetails) return;

    // Validation for overallSatisfaction
    if (data.overallSatisfaction < 1 || data.overallSatisfaction > 5) {
      form.setError("overallSatisfaction", {
        type: "manual",
        message: "Satisfaction must be between 1 and 5",
      });
      return;
    }

    try {
      const submissionData = await api.post(`/event/feedback/${eventId}`, {
        rating: data.overallSatisfaction,
        feedbackText: data.suggestions,
      });
      console.log("Feedback Submitted:", submissionData);
      setIsSubmitted(true);
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      toast.error("Something went wrong while submitting the feedback!");
      console.error("Submission failed", error);
    }
  };

  const handleGoBack = () => {
    navigate("/events");
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <CardHeader>
          <CardTitle>Loading Event Details...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!eventDetails) {
    return (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Unable to load event details. Please check the event link.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Submission confirmation
  if (isSubmitted) {
    return (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            Your feedback for "{eventDetails.name}" has been submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setIsSubmitted(false)} className="w-full">
            Submit Another Feedback
          </Button>
          <Button
            onClick={() => handleGoBack()}
            className="bg-white hover:bg-[#D9D9D9] w-full text-black"
          >
            <SkipPrevious></SkipPrevious>Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 p-4 min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-primary text-2xl">
            Feedback for {eventDetails.name}
          </CardTitle>
          <CardDescription>
            {`Event Date: ${new Date(
              eventDetails.startDate
            ).toLocaleDateString()} | Location: ${eventDetails.location}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Overall Satisfaction */}
              <FormField
                control={form.control}
                name="overallSatisfaction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Satisfaction</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <div className="flex">
                          {[...Array(field.value)].map((_, i) => (
                            <Star
                              key={i}
                              className="fill-current text-yellow-500"
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    {form.formState.errors.overallSatisfaction && (
                      <FormMessage>
                        {form.formState.errors.overallSatisfaction.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Recommendation */}
              <FormField
                control={form.control}
                name="wouldRecommend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Would You Recommend This Event?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Definitely" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Definitely
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Maybe" />
                          </FormControl>
                          <FormLabel className="font-normal">Maybe</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="No" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Suggestions */}
              <FormField
                control={form.control}
                name="suggestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Suggestions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please share your suggestions to help us improve this event"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;
