import { loadStripe } from "@stripe/stripe-js";
import { CardWidget } from "./cardWidget";
import { placeOrder } from "./apiService";


export async function initStripe(){
    const stripe = await loadStripe('pk_test_51Py9jWIDwDhTcMJilXemniebO4xIpqmAnz2Hn1vFtUD7Qv5mYSTqWgyazMW7j5W4F9gZTYmSIrprjx7AAvDkZ07J00hU9T3fAj')
   
    let card = null
    const paymentType = document.querySelector('#paymentType');
    if(!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if(e.target.value === 'card'){
          card = new CardWidget(stripe)
          card.mount()
        }else{
            card.destroy()
        }
    })

const paymentForm = document.querySelector('#payment-form')
if(paymentForm){
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let formData = new FormData(paymentForm);
        let formObject = {}
        for(let [key, value] of formData.entries()){
            formObject[key] = value
        }
        if (!card) {
            // Ajax
            console.log('hello');
            placeOrder(formObject);
          
            
            
            return;
        }
        const token = await card.createToken()
        formObject.stripeToken = token.id;
        placeOrder(formObject);
    }) 
}
}

