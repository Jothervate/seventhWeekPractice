import { Link,useNavigate } from "react-router-dom";
import {useEffect,useState} from 'react';

const Error=()=>{
    const navigate= useNavigate();
    const [timer,setTimer]= useState(5);

    useEffect(()=>{
        // 建立計時器
        const interValId= setInterval(()=>{
            setTimer((prev)=>{
                if(prev<=1){
                    clearInterval(interValId);//當時間小於等於1秒,清除掉interValId中的setInterval
                    navigate('/');//跳轉至首頁
                    return 0; //顯示為0秒
                }

                return prev -1 //否則,就持續減1秒
            })
        },1000);

        // 【重要】清理函式
        // 當元件被卸載 (例如使用者自己點了按鈕離開)，這行會執行
        // 確保計時器被清除，不會在背景繼續跑
        return () => clearInterval(interValId);
    },[navigate]);

    return (
        <div className="text-center" style={{marginTop: '100px'}}>
            <h1 className="display-1">404</h1>
            <p className='lead'>你搜尋的頁面不存在!</p>
            <p className="text-muted">將在{timer}秒內跳轉回首頁!</p>
            <Link to='/' className='btn btn-primary'>
                立即回到首頁
            </Link>
        </div>
    )
}

export default Error;