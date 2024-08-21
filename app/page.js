'use client'

// import { useState } from 'react'
import {
  Container,
  Grid,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Box,
} from '@mui/material';
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import getStripe from '@/utils/get-stripe';
import Link from 'next/link';
// import Head from 'next/head'


export default function Home() {


  const handleSubmit = async () => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    })
    const checkoutSessionJson = await checkoutSession.json()
  
    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })
  
    if (error) {
      console.warn(error.message)
    }
  }

  return(
    <Container>
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" style={{flexGrow: 1}}>
        Flashcard SaaS
      </Typography>
      <SignedOut>
      <Link href="/sign-in" passHref>
         <Button color="inherit">Login</Button>
      </Link>
      <Link href="/sign-up" passHref>
        <Button color="inherit">Sign Up</Button>
      </Link>
        {/* <Button color="inherit" href="/sign-in">Login</Button>
        <Button color="inherit" href="/sign-up">Sign Up</Button> */}
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </Toolbar>
    </AppBar>

    <Box sx={{textAlign: 'center', my: 4}}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Flashcard SaaS
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        The easiest way to create flashcards from your text.
      </Typography>
      <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/generate">
        Get Started
      </Button>

      <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/flashcards">
        View flashcards
      </Button>

      {/* <Button variant="outlined" color="primary" sx={{mt: 2}}>
        Learn More
      </Button> */}
    </Box>

    <Box sx={{my: 6}}>
    <Typography variant="h4" component="h2" gutterBottom>Features</Typography>
    <Grid container spacing={4}>
      {/* Feature items */}
      <Grid item xs={12} md={4}>
      <Typography variant="h6" gutterBottom> Easy text Input</Typography>
      <Typography variant="h6"> Simply input text and let our Software do the rest. 
        Creating flashcard has never been easier! </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
      <Typography variant="h6" gutterBottom> Smart Flashcards</Typography>
      <Typography variant="h6"> Our AI breaks down your text into concise
        flahcards that are perfect for any of your study needs! </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
      <Typography variant="h6" gutterBottom> Accessible anywhere, anytime</Typography>
      <Typography variant="h6"> Access your flashcards from any device at anytime. 
        Always study on the go with ease. Easily generate flashcards fast and keep it 
        100% your style! </Typography>
      </Grid>

    </Grid>
    </Box>

    <Box sx={{my: 6, textAlign: 'center'}}>
      <Typography variant="h4" component="h2" gutterBottom>Pricing</Typography>
      <Grid container spacing={4} justifyContent="center">

        {/* Pricing plans */}
        <Grid item xs={12} md={6}>
        <Box sx={{
          my: 6,
          p: 3,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
        }}>
          
      <Typography variant="h5" gutterBottom> Basic </Typography>
      <Typography variant="h6" gutterBottom> $5/ month </Typography>
      <Typography> Access to basic features and limited storage </Typography>
      <Button variant="contained" color="primary" sx={{mt: 2}} onClick={handleSubmit}>
        Choose Basic
      </Button>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{
          my: 6,
          p: 3,
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
        }}>
          
      <Typography variant="h5" gutterBottom> Premium </Typography>
      <Typography variant="h6" gutterBottom> $10/ month </Typography>
      <Typography> Access to Premium features, unlimited storage and priority support </Typography>
      <Button variant="contained" color="primary" sx={{mt: 2}}>
        Choose Premium
      </Button>
        </Box>
      </Grid>

      </Grid>
    </Box>


  </Container>
  )
}
