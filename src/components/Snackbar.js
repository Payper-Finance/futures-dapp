import React,{useState} from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function Snackbar1({show,setshow}) {
 

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Snackbar open={show} autoHideDuration={6000} onClose={()=>setshow(false)}>
        <Alert onClose={()=>setshow(false)} severity="success" sx={{ width: '100%' }}>
          Transaction Completed!
          <a style={{color:"blue",textDecoration:"underline",marginLeft:"10px"}}> Tzkt...</a>
        </Alert>
      </Snackbar>
      {/* <Alert severity="error">This is an error message!</Alert>
      <Alert severity="warning">This is a warning message!</Alert>
      <Alert severity="info">This is an information message!</Alert>
      <Alert severity="success">This is a success message!</Alert> */}
    </Stack>
  );
}
