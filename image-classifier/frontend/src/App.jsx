import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure you import Axios

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const [objectImage, setObjectImage] = useState(null);
    const [peopleImage, setPeopleImage] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please upload an image file.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        setLoading(true);

        try {
            const response = await axios.post(
                "http://20.127.172.135:5000/analyze-image",
                //"http://localhost:5000/analyze-image",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setResults(response.data); // Save the analysis results
        } catch (error) {
            console.error(error.message);
            alert("Failed to analyze the image.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch images only after results have been updated
    useEffect(() => {
        if (results) {
            setObjectImage(results.object_annotated_image);
            setPeopleImage(results.people_annotated_image);
        }
    }, [results]); // Dependency on results

    return (
        <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
            {/* Navbar */}
            <nav className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-4xl font-bold">
                    Azure AI Image Analysis<h1 className="text-xl">- Iddiyappam group</h1>
                </h1>

                <div className="w-20 h-20 bg-white rounded-full flex justify-center items-center shadow-lg">
                    {/* Logo Placeholder */}
                    <img
                        className="w-20 h-20 rounded-full object-cover"
                        src="https://res.cloudinary.com/dxsffcg6l/image/upload/v1737953085/WhatsApp_Image_2025-01-27_at_10.13.41_8155ec0c_mcp95n.jpg"
                        alt="Logo"
                    />
                </div>
            </nav>
            <div className="min-h-screen">
                {/* Image Selection Box */}
                <div className="mt-8 w-full min-w-2xl p-6 bg-white rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Upload an Image for Analysis
                        </h2>

                        {/* File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-700 bg-blue-50 border border-gray-300 rounded-lg py-3 px-4 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />

                        {/* Image Preview */}
                        {selectedFile && (
                            <div className="mt-4 w-full max-w-xs p-4 bg-gray-50 border border-gray-300 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    Selected Image:
                                </h3>
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected"
                                    className="max-w-full h-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`mt-4 w-full py-3 px-6 text-white font-semibold rounded-lg ${
                                loading
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-600"
                            }`}
                        >
                            {loading ? "Analyzing..." : "Analyze Image"}
                        </button>
                    </form>
                </div>

                {/* Analysis Results */}
                {results && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Analysis Results
                        </h2>

                        {/* Caption */}
                        {results.caption && (
                            <p className="text-lg">
                                <strong>Caption:</strong> {results.caption.text} (
                                <span className="text-blue-600">
                                    {results.caption.confidence.toFixed(2)}%
                                </span>
                                )
                            </p>
                        )}

                        {/* Tags */}
                        {results.tags && (
                            <div className="mt-4">
                                <strong className="text-lg">Tags:</strong>
                                <ul className="list-disc list-inside">
                                    {results.tags.map((tag, index) => (
                                        <li key={index}>
                                            {tag.name} (
                                            <span className="text-blue-600">
                                                {tag.confidence.toFixed(2)}%
                                            </span>
                                            )
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Objects */}
                        {results.objects && (
                            <div className="mt-4">
                                <strong className="text-lg">Objects:</strong>
                                <ul className="list-disc list-inside">
                                    {results.objects.map((obj, index) => (
                                        <li key={index}>
                                            {obj.name} (
                                            <span className="text-blue-600">
                                                {obj.confidence.toFixed(2)}%
                                            </span>
                                            )
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* People Detected */}
                        {results.people && (
                            <div className="mt-4">
                                <strong className="text-lg">People Detected:</strong>
                                <ul className="list-disc list-inside">
                                    {results.people.map((person, index) => (
                                        <li key={index}>
                                            Confidence:{" "}
                                            <span className="text-blue-600">
                                                {person.confidence.toFixed(2)}%
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Object Annotated Image */}
                        {objectImage && (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold">Objects Annotated Image:</h3>
                                <img
                                    src={`http://20.127.172.135:5000${objectImage}`}
                                    //src={`http://localhost:5000${objectImage}`}
                                    alt="Object Annotated"
                                    className="mt-2 max-w-full h-auto rounded-lg"
                                />
                            </div>
                        )}

                        {/* People Annotated Image */}
                        {peopleImage && (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold">People Annotated Image:</h3>
                                <img
                                    src={`http://20.127.172.135:5000${peopleImage}`}
                                    //src={`http://localhost:5000${peopleImage}`}
                                    alt="People Annotated"
                                    className="mt-2 max-w-full h-auto rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
