class Users {
  static instances: Users;

  #users: userType[];
  #error: userType[];

  constructor() {
    this.#users = [
      {
        id: "001",
        name: "Coder Hero",
        username: "coderhero",
        password: "Fath1nhal1m",
        pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
        ban: false,
        bookmark: [],
      },
    ];
    this.#error = [
      {
        id: "System",
        name: "Username is Taken",
        username: "system",
        password: "system",
        pp: "",
        ban: false,
      },
      {
        id: "System",
        name: "This User Not Found!",
        username: "system",
        password: "system",
        pp: "",
        ban: false,
      },
    ]; //list kemungkinan error
  }

  static getInstances() {
    if (!Users.instances) Users.instances = new Users(); //Untuk ngestart class
    return Users.instances;
  }

  signUp(name: string, username: string, password: string): userType {
    //untuk signup
    const isNameTaken: boolean = this.#users.some(
      (user) =>
        user.name === name ||
        user.username === username ||
        user.name.length > 50
    ); //cek namenya aman gak
    if (isNameTaken) return this.#error[0];

    const newUser: userType = {
      id: this.#users.length.toString(),
      name: name,
      username: username,
      password: password,
      pp: "https://cdn.glitch.global/55de0177-2d52-43bf-a066-45796ec8e7c9/fathin.jpeg?v=1713409662281",
      ban: false,
      bookmark: [],
    };

    this.#users.push(newUser); //di push

    return newUser; //di return
  }

  login(username: string, password: string): userType {
    //Login
    const userIndex: number = this.#users.findIndex(
      (user) =>
        user.username === username &&
        user.password === password &&
        user.ban === false
    ); //? Cek nih uname, password, ban nya aman gak
    return userIndex !== -1 ? this.#users[userIndex] : this.#error[1]; //return kalau ada bearti return usernya, kalau enggak ke error 1
  }
}

export default Users;
