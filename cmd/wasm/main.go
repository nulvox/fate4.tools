package main

import (
	"encoding/json"
	"errors"
	"syscall/js"

	"fate4.tools/internal/character"
)

var errMissingArg = errors.New("missing required argument")

func errorResult(err error) string {
	result := map[string]string{"error": err.Error()}
	out, _ := json.Marshal(result)
	return string(out)
}

func toJSArray(strs []string) []any {
	result := make([]any, len(strs))
	for i, s := range strs {
		result[i] = s
	}
	return result
}

func createCharacter() js.Func {
	return js.FuncOf(func(_ js.Value, _ []js.Value) any {
		c := character.NewCharacter()
		data, err := c.ToJSON()
		if err != nil {
			return errorResult(err)
		}
		return string(data)
	})
}

func updateCharacter() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) < 1 {
			return errorResult(errMissingArg)
		}
		jsonStr := args[0].String()
		c, err := character.FromJSON([]byte(jsonStr))
		if err != nil {
			return errorResult(err)
		}
		warnings := character.ValidateCharacter(c)
		data, err := c.ToJSON()
		if err != nil {
			return errorResult(err)
		}
		result := map[string]any{
			"character": string(data),
			"warnings":  toJSArray(warnings),
		}
		out, _ := json.Marshal(result)
		return string(out)
	})
}

func validateCharacterJS() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) < 1 {
			return errorResult(errMissingArg)
		}
		c, err := character.FromJSON([]byte(args[0].String()))
		if err != nil {
			return errorResult(err)
		}
		warnings := character.ValidateCharacter(c)
		out, _ := json.Marshal(warnings)
		return string(out)
	})
}

func importCharacter() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) < 1 {
			return errorResult(errMissingArg)
		}
		c, err := character.FromJSON([]byte(args[0].String()))
		if err != nil {
			return errorResult(err)
		}
		warnings := character.ValidateCharacter(c)
		data, err := c.ToJSON()
		if err != nil {
			return errorResult(err)
		}
		result := map[string]any{
			"character": string(data),
			"warnings":  toJSArray(warnings),
		}
		out, _ := json.Marshal(result)
		return string(out)
	})
}

func exportCharacter() js.Func {
	return js.FuncOf(func(_ js.Value, args []js.Value) any {
		if len(args) < 1 {
			return errorResult(errMissingArg)
		}
		c, err := character.FromJSON([]byte(args[0].String()))
		if err != nil {
			return errorResult(err)
		}
		data, err := c.ToJSON()
		if err != nil {
			return errorResult(err)
		}
		return string(data)
	})
}

func getDefaultSkills() js.Func {
	return js.FuncOf(func(_ js.Value, _ []js.Value) any {
		skills := character.DefaultSkills()
		out, _ := json.Marshal(skills)
		return string(out)
	})
}

func getFateLadder() js.Func {
	return js.FuncOf(func(_ js.Value, _ []js.Value) any {
		ladder := character.FateLadder()
		out, _ := json.Marshal(ladder)
		return string(out)
	})
}

func main() {
	js.Global().Set("createCharacter", createCharacter())
	js.Global().Set("updateCharacter", updateCharacter())
	js.Global().Set("validateCharacter", validateCharacterJS())
	js.Global().Set("importCharacter", importCharacter())
	js.Global().Set("exportCharacter", exportCharacter())
	js.Global().Set("getDefaultSkills", getDefaultSkills())
	js.Global().Set("getFateLadder", getFateLadder())
	js.Global().Get("console").Call("log", "WASM loaded")

	// Keep the Go program running so JS can call exported functions.
	select {}
}
