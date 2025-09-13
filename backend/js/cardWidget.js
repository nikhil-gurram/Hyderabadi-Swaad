// The CardWidget class handles the creation, mounting, and management of Stripe's card element and token creation.
export class CardWidget {
    // Declare properties for the Stripe instance and the card element (null by default)
    stripe = null
    card = null

    // Define the styling for the card input field
    style = {
        base: {
            color: '#32325d', // Basic color of text
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif', // Font style
            fontSmoothing: 'antialiased', // Smooth font rendering
            fontSize: '16px', // Font size
            '::placeholder': {
                color: '#aab7c4' // Placeholder text color
            }
        },
        invalid: {
            color: '#fa755a', // Text color for invalid input
            iconColor: '#fa755a' // Icon color for invalid input (e.g. error icon)
        }
    }

    // The constructor receives the Stripe instance (which has been loaded using loadStripe)
    constructor(stripe) {
        this.stripe = stripe // Assign the stripe instance to the class
    }

    // This method mounts the card element onto a DOM element
    mount() {
        const elements = this.stripe.elements() // Create a Stripe elements object
        this.card = elements.create('card', { 
            style: this.style, // Use the defined styles for the card element
            hidePostalCode: true // Optionally hide the postal code field
        })
        this.card.mount('#card-element') // Mount the card element to the DOM element with id "card-element"
    }

    // This method destroys the card element when it is no longer needed (e.g. to clean up)
    destroy() {
        this.card.destroy() // Remove the card element from the DOM
    }

    // This method creates a token based on the card input details
    async createToken() {
        try {
            // Create a token using the stripe instance and the card element
            const result = await this.stripe.createToken(this.card)
            return result.token // Return the generated token if successful
        } catch(err) {
            // Catch and log any errors that occur during token creation
            console.log(err);
        }
    }
}
