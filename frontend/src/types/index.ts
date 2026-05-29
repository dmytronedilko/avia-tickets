export type Cabin = "economy" | "premium" | "business" | "first";
export type TripType = "round" | "oneway";

export interface Flight {
  id: number;
  origin: string;
  destination: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  availableSeats: number;
  cabin: Cabin;
}

export interface BookingResponse {
  id: number;
  flightId: number;
  returnFlightId: number | null;
  userId: number;
  bookingTime: string;
  status: string;
  passengers: number;
  pricePaid: number;
  balance: number;
  flight: Flight;
  returnFlight: Flight | null;
  passenger: {
    name: string;
    email: string;
  };
}

export interface MyBooking {
  id: number;
  flightId: number;
  returnFlightId: number | null;
  passengers: number;
  bookingTime: string;
  status: string;
  pricePaid: number;
  flight: Flight;
  returnFlight: Flight | null;
}

export interface CancelBookingResult {
  id: number;
  status: string;
  refund: number;
  balance: number;
}

export type FlightSort = "best" | "cheapest" | "fastest" | "earliest";

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  tripType: TripType;
  passengers: number;
  cabin: Cabin;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  balance: number;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}
