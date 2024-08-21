'use client'

import { useState } from 'react'
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  AppBar,
  Toolbar,
  CircularProgress,
  Paper, // Import CircularProgress for the loading spinner
} from '@mui/material'
import Link from 'next/link';
import { useUser } from '@clerk/nextjs'
import { SignedOut, SignedIn, UserButton } from '@clerk/nextjs';
import dynamic from 'next/dynamic'
import { db } from '@/firebase';
import { collection, doc, writeBatch, getDoc } from 'firebase/firestore';

// Dynamically import Firebase to ensure it's only used client-side
const firestore = dynamic(() => import('firebase/firestore'), { ssr: false });

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcards, setFlashcards] = useState([])
  const [text, setText] = useState('')
  const [setName, setSetName] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false) // State to track loading status
  const [flipped, setFlipped] = useState([])

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }

    setLoading(true) // Set loading to true when the generation starts

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: text,
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setFlashcards(data)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    } finally {
      setLoading(false) // Set loading to false when the generation is complete
    }
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const saveFlashcards = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      alert('You must be signed in to save flashcards.');
      return;
    }

    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.');
      return;
    }

    try {
      const userDocRef = doc(collection(db, 'users'), user.id);
      const userDocSnap = await getDoc(userDocRef);

      const batch = writeBatch(db);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const updatedSets = [...(userData.flashcardSets || []), { name: setName }];
        batch.update(userDocRef, { flashcardSets: updatedSets });
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] });
      }

      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName);
      batch.set(setDocRef, { flashcards });

      await batch.commit();

      alert('Flashcards saved successfully!');
      handleClose();
      setSetName('');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('An error occurred while saving flashcards. Please try again.');
    }
  }

  return (
    <Container maxWidth="md">
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
              View flashcards
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

      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Flashcards
        </Typography>
        <Paper sx={{p:4, width:'100%'}}>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Enter text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          disabled={loading} // Disable the button while loading
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Flashcards'} {/* Show loading spinner or button text */}
        </Button>
        </Paper>
      </Box>

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Generated Flashcards
          </Typography>
          <Grid container spacing={2}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea onClick={() =>{handleCardClick(index)}}>                 
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
        </Box>
      )}

      {flashcards.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="secondary" onClick={handleOpen}>
            Save Flashcards
          </Button>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={saveFlashcards} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}


// 'use client'

// import { useState } from 'react'
// import {
//   Container,
//   Grid,
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Card,
//   CardContent,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   DialogContentText,
// } from '@mui/material'
// import { useUser } from '@clerk/nextjs'
// // import { useRouter } from 'next/navigation'
// import { doc, collection, getDoc } from '@firebase/firestore';
// import { db } from '@/firebase';
// import { writeBatch } from 'firebase/firestore'


// export default function Generate() {
// const { isLoaded, isSignedIn, user } = useUser()
// const [flashcards, setFlashcards] = useState([])
// // const [flipped, setFlipped]= useState([])
// const [text, setText] = useState('')
// const [setName, setSetName] = useState('')
// const [open, setOpen] = useState(false)
// // const router = useRouter()

// //handle submit and retrive flashcards
//   const handleSubmit = async () => {
//     if (!text.trim()) {
//       alert('Please enter some text to generate flashcards.')
//       return
//     }
  
//     try {
//       const response = await fetch('/api/generate', {
//         method: 'POST',
//         body: text,
//       })
  
//       if (!response.ok) {
//         throw new Error('Failed to generate flashcards')
//       }
  
//       const data = await response.json()
//       setFlashcards(data)
//     } catch (error) {
//       console.error('Error generating flashcards:', error)
//       alert('An error occurred while generating flashcards. Please try again.')
//     }
//   }

// //   const handleCardClick = (id) => {
// //     setFlipped((prev) => ({
// //       ...prev,
// //       [id]: !prev[id],
// //     }))
// //   }

//   const handleOpen = () =>{
//     setOpen(true)
//   }

//   const handleClose = () =>{
//     setOpen(false)
//   }

// //////Save flash card
//   const saveFlashcards = async () => {
//     if (!setName.trim()) {
//       alert('Please enter a name for your flashcard set.')
//       return
//     }
  
//     try {
//       const userDocRef = doc(collection(db, 'users'), user.id)
//       const userDocSnap = await getDoc(userDocRef)
  
//       const batch = writeBatch(db)
  
//       if (userDocSnap.exists()) {
//         const userData = userDocSnap.data()
//         const updatedSets = [...(userData.flashcardSets || []), { name: setName }]
//         batch.update(userDocRef, { flashcardSets: updatedSets })
//       } else {
//         batch.set(userDocRef, { flashcardSets: [{ name: setName }] })
//       }
  
//       const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName)
//       batch.set(setDocRef, { flashcards })
  
//       await batch.commit()
  
//       alert('Flashcards saved successfully!')
//       handleClose()
//       setSetName('')
//     } catch (error) {
//       console.error('Error saving flashcards:', error)
//       alert('An error occurred while saving flashcards. Please try again.')
//     }
//   }


//     return (
//     <Container maxWidth="md">
//       <Box sx={{ my: 4 }}>
//         <Typography variant="h4" component="h1" gutterBottom>
//           Generate Flashcards
//         </Typography>
//         <TextField
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           label="Enter text"
//           fullWidth
//           multiline
//           rows={4}
//           variant="outlined"
//           sx={{ mb: 2 }}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           fullWidth
//         >
//           Generate Flashcards
//         </Button>
//       </Box>
      
//       {/* We'll add flashcard display here */}

//     {flashcards.length > 0 && (
//         <Box sx={{ mt: 4 }}>
//             <Typography variant="h5" component="h2" gutterBottom>
//             Generated Flashcards
//             </Typography>
//             <Grid container spacing={2}>
//             {flashcards.map((flashcard, index) => (
//                 <Grid item xs={12} sm={6} md={4} key={index}>
//                 <Card>
//                     <CardContent>
//                     <Typography variant="h6">Front:</Typography>
//                     <Typography>{flashcard.front}</Typography>
//                     <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography>
//                     <Typography>{flashcard.back}</Typography>
//                     </CardContent>
//                 </Card>
//                 </Grid>
//             ))}
//             </Grid>
//         </Box>
//     )}

//     {flashcards.length > 0 && (
//         <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
//             <Button variant="contained" color="primary" onClick={handleOpen}>
//             Save Flashcards
//             </Button>
//         </Box>
//     )}

//     <Dialog open={open} onClose={handleClose}>
//     <DialogTitle>Save Flashcard Set</DialogTitle>
//     <DialogContent>
//         <DialogContentText>
//         Please enter a name for your flashcard set.
//         </DialogContentText>
//         <TextField
//         autoFocus
//         margin="dense"
//         label="Set Name"
//         type="text"
//         fullWidth
//         value={setName}
//         onChange={(e) => setSetName(e.target.value)}
//         />
//     </DialogContent>
//     <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button onClick={saveFlashcards} color="primary">
//         Save
//         </Button>
//     </DialogActions>
//     </Dialog>

//     </Container>
//   )

// }