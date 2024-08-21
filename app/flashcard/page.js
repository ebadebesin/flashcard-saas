'use client'

//imports
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, collection, getDoc, getDocs } from '@firebase/firestore';
import { db } from '@/firebase';
import {
    Container,
    Grid,
    Button,
    Typography,
    Divider,
    Box,
    Card,
    CardContent,
    CardActionArea,
    AppBar,
    Toolbar,
  } from '@mui/material'

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])

    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    // useEffect(() => {
    //     async function getFlashcard() {
    //       if (!search || !user) return;
      
    //       console.log("Searching for flashcard set:", search);
      
    //       const flashcardSetRef = doc(
    //         collection(db, 'users'),
    //         user.id,
    //         'flashcardSets',
    //         search
    //       );
      
    //       const flashcardSetDoc = await getDoc(flashcardSetRef);
      
    //       if (!flashcardSetDoc.exists) {
    //         console.error("Flashcard set not found!");
    //         return;
    //       }
      
    //       const flashcardsColRef = collection(flashcardSetRef, 'flashcards');
    //       const querySnapshot = await getDocs(flashcardsColRef);
    //   console.log(querySnapshot)
    //       if (querySnapshot.empty) {
    //         console.log("This flashcard set has no flashcards!");
    //         return;
    //       }
      
    //       const flashcards = [];
    //       querySnapshot.forEach((doc) => {
    //         flashcards.push({ id: doc.id, ...doc.data() });
    //       });
      
    //       setFlashcards(flashcards);
    //     }
      
    //     getFlashcard();
    //   }, [search, user]);

    useEffect(() => {
        async function getFlashcard() {
          if (!search || !user) return
     
        //   const colRef = collection(doc(collection(db, 'users'), user.id), search)
        const colRef = doc( // Reference to the flashcard set document
            collection(db, 'users'),
            user.id,
            'flashcardSets',
            search // Assuming search contains the set name
          );

            console.log(search)
        //   const docs = await getDocs(colRef)
        const docs = await getDocs(collection(colRef, 'flashcardSets')); // Reference to flashcardSets subcollection
            console.log(colRef)
            
        if (docs.empty) {
            console.log("No such flashcard set or flashcards!");
        } else {

          const flashcards = []

          docs.forEach((doc) => {
            flashcards.push({ id: doc.id, ...doc.data() })
          })
         
          setFlashcards(flashcards)
        }

        }
        getFlashcard()
    }, [search, user])

      const handleCardClick = (id) => {
        setFlipped((prev) => ({
          ...prev,
          [id]: !prev[id],
        }))
      }

    if (!isLoaded || !isSignedIn){
        return <> </>
    }

    return(
        <Container maxWidth="lg">

      <AppBar position="static" sx={{backgroundColor: '#3f51b5'}}>
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
            <Link href="/flashcards" passHref>
              Back
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
      
      <Box>
        <Typography variant='h3' color="darkblue">{search} flashcards </Typography>
        <Divider sx={{ bgcolor: 'primary.main', width: 800 }} />
      </Box>

            <Grid container spacing={3} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea onClick={() =>{handleCardClick(flashcard.id)}}>                 
                    <CardContent>
                      <Box sx={{
                        perspective:'1000px',
                        '& > div': {
                          transition: 'transform 0.6s',
                          transformStyle: 'preserve-3d',
                          position: 'relative',
                          width: '100%',
                          height: '200px',
                          boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.2)',
                          transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        },
                        '& > div> div': {
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 2,
                          boxSizing: 'border-box',
                        },
                        '& > div > div: nth-of-type(2)': {
                          transform: 'rotateY(180deg)'
                        },
                      }}>
                        <div>
                          <div>
                            <Typography variant="h4" component="div"></Typography>
                            <Typography color="darkblue">Question: {flashcard.front}</Typography>
                          </div>

                          <div>
                            <Typography variant="h6" component="div" sx={{ mt: 2 }}></Typography>
                            <Typography>Answer: {flashcard.back}</Typography>
                          
                          </div>
                        </div>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
    )

}