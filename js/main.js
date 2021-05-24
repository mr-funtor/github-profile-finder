//don't forget pull requests turns to pulls
//don't forget to return when there is nothing typed
//don't forget to give display if no user is found

const mainSearch= document.querySelector('.main-search');

mainSearch.addEventListener('keydown',checkUser)

function checkUser(e){
	if(e.keyCode===13){
		
		if(mainSearch.value.length===0)return;//stops the event if no name was typed
		
		let url="https://api.github.com/graphql";
		
		let newUser=mainSearch.value;//picks out the username from the from input
		
			//setup the query for the GRAPHql
	const query={
			"query":`
		query{ 
		  
		 user (login:"${newUser}") {
			id
			name
			login
			bio
			avatarUrl(size:4)
			repositories(first:20) {
			  edges {
				node {
				  id
				  name
				  description
				  forkCount
				  primaryLanguage {
					name
				  }
				  updatedAt
				  stargazerCount
				}
			  }
			}
		  }
		}`
		};
		
		
			let h = new Headers();
			h.append("Content-Type", "application/json");
			// let encoded=window.btoa("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");
			let auth= "bearer " + "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";
			h.append('Authorization', auth);
			
			console.log(auth);
			
			let req= new Request(url,{
				method:'POST',
				headers:h,
				credentials:'same-origin',
				body: JSON.stringify(query)
			});
			
			fetch(req)
			.then(response => response.json())
		.then((data)=>{
			// console.log(JSON.stringify(data));
			const newData=JSON.stringify(data);
			const changedData=JSON.parse(newData);
			console.log(changedData.data.user.repositories.edges)
		})
		.catch(err=>console.log(JSON.stringify(err)));
		
	}
	
}


