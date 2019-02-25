# authentication
Assignment code for create user, login, reset password, forgot password

In this project I have used Node.js with MySQL and Sequelize ORM

Exaple request for create user:
POST - localhost:8080/createUser
{
	"firstName":"Megha",
	"lastName":"Hegde",
	"email":"megha.hegde951@gmail.com",
	"password":"megha123"
}

Example request for login:
POST - localhost:8080/login
{
	"email":"megha.hegde95@gmail.com",
	"password":"megha789"
}

Example request for reset password:
POST - localhost:8080/resetPassword
{
	"email":"megha.hegde95@gmail.com",
	"oldPassword":"Megha123",
	"newPassword":"megha789"
}

Example request for forgot password:
POST - localhost:8080/forgotPassword
{
	"email":"megha.hegde95@gmail.com"
}
