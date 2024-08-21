'use client'

//imports
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { doc, collection, getDoc, setDoc } from '@firebase/firestore';
import { db } from '@/firebase';
import { Button, Container, Grid, Card, CardActionArea, CardContent, Typography, AppBar, Toolbar, } from '@mui/material';
import Link from 'next/link';


export default function Flashcards() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()

    useEffect(() => {
        async function getFlashcards() {
          if (!user) return

          const docRef = doc(collection(db, 'users'), user.id)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const collections = docSnap.data().flashcardSets || []

            setFlashcards(collections)
          } else {
            await setDoc(docRef, { flashcardSets: [] })
            console.log("No such document!");
          }
        }
        getFlashcards()
    }, [user])

    if (!isLoaded){
        return <div> <h1>...Loading</h1></div>
    } else if (!isSignedIn) {
        return <div> 
           <h1>404</h1>  
            <br>
            </br> 
            <h3>Not signed in...</h3>
            <h2>Please sign in to view your saved flashcards</h2>
        </div>
    }

   

    const handleCardClick = (name) => {
        router.push(`/flashcard?id=${encodeURIComponent(name)}`); //id
    }

    return (
        <Container maxWidth="md">

        <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <Button color="inherit">
            <Link href="/" passHref>
                Home
            </Link>
          </Button>
          <Button color="inherit">
            <Link href="/generate" passHref>
              New
            </Link>
          </Button>
          <SignedOut>
            <Link href="/sign-in" passHref>
              <Button color="inherit">Login</Button>
            </Link>
            <Link href="/sign-up" passHref>
              <Button color="inherit">Sign Up</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

        <Grid container spacing={3} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                    <CardActionArea onClick={() => {handleCardClick(flashcard.name)}}>
                    <CardContent>
                        <Typography variant="h5">
                            {flashcard.name}
                        </Typography>
                    </CardContent>
                    </CardActionArea>
                </Card>
                </Grid>
            ))
            
            }
            </Grid>
        </Container>
    )

}
