import React,{useState} from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function Snackbar1({show,setshow,type}) {
 

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {type=="success"?(
 <Snackbar open={show} autoHideDuration={6000} onClose={()=>setshow(false)}>
 <Alert onClose={()=>setshow(false)} severity="success" sx={{ width: '100%' }}>
   Transaction Completed!
   <a style={{color:"blue",textDecoration:"underline",marginLeft:"10px"}}> Tzkt...</a>
 </Alert>
</Snackbar>
      ):(
<Snackbar open={show} autoHideDuration={6000} onClose={()=>setshow(false)}>
        <Alert onClose={()=>setshow(false)} severity="error" sx={{ width: '100%' }}>
          Transaction Failed!
          <a style={{color:"blue",textDecoration:"underline",marginLeft:"10px"}}> Tzkt...</a>
        </Alert>
      </Snackbar>
      )}
       
      
    
    </Stack>
  );
}
