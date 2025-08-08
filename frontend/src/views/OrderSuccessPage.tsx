import { useParams } from "react-router-dom";

export default function OrderSuccessPage(){
  const { orderId } = useParams();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-4">Thank you!</h2>
      <p>Your order {orderId} has been placed. You will receive download access when the payment is confirmed.</p>
    </div>
  )
}
