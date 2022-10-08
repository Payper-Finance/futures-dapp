import React,{useState} from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


export default function Snackbar1({show,setshow,type}) {
 

  return (
    <Stack style={{position:"absolute"}} spacing={2} sx={{ width: '100%' }}>
      {type.type=="success"?(
 <Snackbar open={show} autoHideDuration={6000} onClose={()=>setshow(false)}>
 <Alert onClose={()=>setshow(false)} severity="success" sx={{ width: '100%' }}>
 {type.message}
   <a href={`https://ghostnet.tzkt.io/${type.transaction}/`} target="_blank" rel="noopener noreferrer" style={{color:"blue",textDecoration:"underline",marginLeft:"10px"}}> {type.transaction}</a>
 </Alert>
</Snackbar>
      ):(
<Snackbar open={show} autoHideDuration={6000} onClose={()=>setshow(false)}>
        <Alert onClose={()=>setshow(false)} severity="error" sx={{ width: '100%' }}>
        {type.message}
          <a href={`https://ghostnet.tzkt.io/${type.transaction}/`}  target="_blank" rel="noopener noreferrer" style={{color:"blue",textDecoration:"underline",marginLeft:"10px"}}> {type.transaction}</a>
        </Alert>
      </Snackbar>
      )}
       
      
    
    </Stack>
  );
}
