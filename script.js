const { select, input, checkbox } = require("@inquirer/prompts")
const fs = require("fs").promises

let message = "Bem vindo ao App de Metas";
let goals

const loadingGoals = async () => {
  try {
    const data = await fs.readFile("db.json", "utf-8")
    goals = JSON.parse(data)
  } catch (error) {
    goals = []
  }
}

const saveGoals = async () => {
  await fs.writeFile("db.json", JSON.stringify(goals, null, 2))
}

const registerGoals = async () => {
  const goal = await input({ message: "Digite a meta:" })

  if (goal.length == 0) {
    message = "A meta não pode ser vazia."
    return
  }

  goals.push(
    { value: goal, checked: false }
  )
  message = "Meta cadastrada com sucesso!"
}

const listGoals = async () => {
  if (goals.length == 0) {
    message = "Não existem metas!"
    return
  }

  const answers = await checkbox({
    message: "Use as setas para mudar de meta, o espaço para marcar ou desmarcar e o Enter para finalizar essa etapa",
    choices: [...goals],
    instructions: false,
  })

  goals.forEach((g) => {
    g.checked = false
  })

  if (answers.length == 0) {
    message = "Nenhuma meta selecionada!"
    return
  }

  answers.forEach((answer) => {
    const goal = goals.find((g) => {
      return g.value == answer
    })
    goal.checked = true
  })
  message = "Meta(s) marcado(s) como concluída(s)"
}

const goalsAccomplish = async () => {
  if (goals.length == 0) {
    message = "Não exitem metas!"
    return
  }

  const accomplish = goals.filter((goal) => {
    return goal.checked
  })

  if (accomplish.length == 0) {
    message = "Não existem metas realizadas!"
    return
  }

  await select({
    message: "Metas Realizadas: " + accomplish.length,
    choices: [...accomplish]
  })
}

const openGoals = async () => {
  if (goals.length == 0) {
    message = "Não exitem metas!"
    return
  }

  const opens = goals.filter((goal) => {
    return goal.checked != true
  })

  if (opens.length == 0) {
    message = "Não existem metas abertas!"
    return
  }

  await select({
    message: "Metas Abertas: " + opens.length,
    choices: [...opens]
  })
}


const deleteGoals = async () => {
  if (goals.length == 0) {
    message = "Não existem metas!"
    return
  }

  const goalsUnchecked = goals.map((goal) => {
    return { value: goal.value, checked: false }
  })

  const itemsTodelete = await checkbox({
    message: "Selecione o item para deletar",
    choices: [...goalsUnchecked],
    instructions: false,
  })

  if (itemsTodelete.length == 0) {
    message = "Nenhum item para deletar!"
    return
  }

  itemsTodelete.forEach((item) => {
    goals = goals.filter((goal) => {
      return goal.value != item
    })
  })
  message = "Meta(s) deletada(s) como sucesso!"
}

const showMessage = () => {
  console.clear();

  if (message != "") {
    console.log(message)
    console.log("")
    message = ""
  }
}

const start = async () => {
  await loadingGoals()

  while(true) {
    showMessage()
    await saveGoals()

    const options = await select({
      message: "Menu >",
      choices : [
        {
          name: "Cadastrar meta",
          value: "cadastrar"
        },
        {
          name: "Listar metas",
          value: "listar"
        },
        {
          name: "Metas realizadas",
          value: "realizadas"
        },
        {
          name: "Metas abertas",
          value: "abertas"
        },
        {
          name: "Deletar metas",
          value: "deletar"
        },
        {
          name: "Sair",
          value: "sair"
        }
      ]
    })

    switch (options) {
      case "cadastrar":
        await registerGoals()
        break
      case "listar":
        await listGoals()
        break
      case "realizadas":
        await goalsAccomplish()
        break
      case "abertas":
        await openGoals()
        break
      case "deletar":
        await deleteGoals()
        break
      case "sair":
        console.log("Até a próxima!")
        return
    }
  }
}

start();