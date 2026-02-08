import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { removeMessage } from './toastSlice';

const Toast =()=>{
    const {message, status , visible}= useSelector((state)=>state.toast);
    const dispatch= useDispatch();
    
    useEffect(()=>{
        if(visible){
            setTimeout(()=>{
                dispatch(removeMessage());
            },3000);
        };
    },[visible,dispatch]);

    return (
        <div className={`toast-container position-fixed top-0 end-0 p-3`} 
            style={{ zIndex: 1500, display: visible ? 'block' : 'none' }}>

            <div className={`toast show align-items-center text-white bg-${status} border-0`}>
                <div className="d-flex">
                <div className="toast-body">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {message}
                </div>
                <button 
                    type="button" 
                    className="btn-close btn-close-white me-2 m-auto" 
                    onClick={() => dispatch(removeMessage())}
                ></button>
                </div>
            </div>
        </div>
    )
}

export default Toast;